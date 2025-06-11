import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) return res.status(400).json({ error: 'Project ID required' });

  if (req.method === 'POST') {
    const { regionalMultiplier = 1.0, brandTier = 'standard' } = req.body || {};
    const { error } = await supabase.functions.invoke('cost_worker', {
      body: { projectId: id, regionalMultiplier, brandTier },
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(202).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 