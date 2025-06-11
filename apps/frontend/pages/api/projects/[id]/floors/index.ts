import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { method, body } = req;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  switch (method) {
    case 'GET': {
      const { data, error } = await supabase
        .from('floors')
        .select('*')
        .eq('project_id', id)
        .order('level');

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    case 'POST': {
      const { name, level, height, floorType } = body;
      const { data, error } = await supabase.from('floors').insert({
        project_id: id,
        name,
        level,
        height,
        floor_type: floorType,
      }).select().single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 