import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Project ID required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { error } = await supabase.functions.invoke('recalc_worker', {
    body: { projectId: id },
  });

  if (error) {
    console.error('Invoke recalc error', error);
    return res.status(500).json({ error: 'invoke error' });
  }

  res.status(202).json({ ok: true });
} 