import { OpenAI } from 'openai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Client instance for getting user from JWT
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Zod schema for final model input
const ModelSchema = z.object({
  siteLocation: z.string().min(1),
  brandFlag: z.string().min(1),
  floorCount: z.number().int().min(1).max(40),
  roomTypes: z.array(z.string()).min(1),
  floorMix: z.array(
    z.object({
      floorIndex: z.number().int().min(1),
      roomsByType: z.record(z.number().int().min(0))
    })
  ),
  publicAreas: z.array(
    z.object({
      area: z.string(),
      enabled: z.boolean(),
      size: z.number().int().min(0)
    })
  )
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define the conversation steps
const conversationSteps = [
  {
    id: 'location',
    question: "Let's start with the basics! What city or ZIP code is your hotel project located in?",
    responseType: 'text',
    extract: (messages) => {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      return lastUserMessage?.content;
    }
  },
  {
    id: 'brand',
    question: "Great! What hotel brand or flag are you planning for this project?",
    responseType: 'choices',
    choices: ['Marriott', 'Hilton', 'IHG', 'Hyatt', 'Choice Hotels', 'Wyndham', 'Independent', 'Other'],
    allowCustom: true,
    extract: (messages) => {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      return lastUserMessage?.content;
    }
  },
  {
    id: 'floors',
    question: "How many floors will your hotel have? (Including ground floor)",
    responseType: 'text',
    extract: (messages) => {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      const floors = parseInt(lastUserMessage?.content || '0');
      return isNaN(floors) ? null : floors;
    }
  },
  {
    id: 'roomTypes',
    question: "What types of rooms will you offer? Select all that apply:",
    responseType: 'choices',
    choices: ['Standard King', 'Standard Double', 'Junior Suite', 'Executive Suite', 'Presidential Suite', 'Accessible Room'],
    allowCustom: false,
    multiSelect: true,
    extract: (messages) => {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      try {
        return JSON.parse(lastUserMessage?.content || '[]');
      } catch {
        return [lastUserMessage?.content];
      }
    }
  },
  {
    id: 'roomMix',
    question: "Now let's plan your room mix by floor. Please specify how many of each room type per floor:",
    responseType: 'table',
    extract: (messages, data) => {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      try {
        return JSON.parse(lastUserMessage?.content || '[]');
      } catch {
        return null;
      }
    }
  },
  {
    id: 'publicAreas',
    question: "Finally, which public areas and amenities will your hotel include?",
    responseType: 'areas',
    publicAreas: ['Lobby', 'Restaurant', 'Bar/Lounge', 'Fitness Center', 'Business Center', 'Meeting Rooms', 'Pool', 'Spa', 'Gift Shop', 'Parking Garage'],
    extract: (messages) => {
      const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
      try {
        return JSON.parse(lastUserMessage?.content || '[]');
      } catch {
        return [];
      }
    }
  }
];

function extractDataFromMessages(messages) {
  const data = {};
  let currentStepIndex = 0;
  
  // Skip system message
  const userMessages = messages.filter((m, i) => i > 0 && m.role === 'user');
  
  for (let i = 0; i < userMessages.length && currentStepIndex < conversationSteps.length; i++) {
    const step = conversationSteps[currentStepIndex];
    const extracted = step.extract(messages.slice(0, (i + 1) * 2 + 1), data);
    if (extracted !== null && extracted !== undefined) {
      data[step.id] = extracted;
      currentStepIndex++;
    }
  }
  
  return { data, nextStepIndex: currentStepIndex };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Get user from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  let user;
  try {
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !authUser) {
      return res.status(401).json({ error: 'Invalid authorization token' });
    }
    user = authUser;
  } catch (err) {
    return res.status(401).json({ error: 'Failed to authenticate user' });
  }

  try {
    const { data, nextStepIndex } = extractDataFromMessages(messages);
    
    // Check if we have all the data needed
    if (nextStepIndex >= conversationSteps.length) {
      // Generate the final model
      const model = {
        siteLocation: data.location,
        brandFlag: data.brand,
        floorCount: data.floors,
        roomTypes: data.roomTypes,
        floorMix: data.roomMix,
        publicAreas: data.publicAreas
      };
      
      // Validate the model
      const validatedModel = ModelSchema.parse(model);
      
      // Save to database
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          user_id: user.id,
          name: `${validatedModel.brandFlag} Hotel - ${validatedModel.siteLocation}`,
          status: 'Draft'
        }])
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      const { error: modelError } = await supabase
        .from('hotel_base_models')
        .insert([{
          project_id: project.id,
          data: validatedModel
        }]);
      
      if (modelError) throw modelError;
      
      return res.status(200).json({ 
        model: validatedModel,
        projectId: project.id,
        message: "Perfect! I've created your hotel base model. Redirecting to your projects..."
      });
    }
    
    // Get the next question
    const nextStep = conversationSteps[nextStepIndex];
    const question = {
      id: nextStep.id,
      text: nextStep.question,
      responseType: nextStep.responseType,
      choices: nextStep.choices,
      allowCustom: nextStep.allowCustom,
      multiSelect: nextStep.multiSelect,
      floorCount: data.floors,
      roomTypes: data.roomTypes,
      publicAreas: nextStep.publicAreas
    };
    
    return res.status(200).json({ question });
  } catch (err) {
    console.error('Chat API Error:', err);
    return res.status(500).json({ error: err.message || 'An error occurred while processing your request' });
  }
} 