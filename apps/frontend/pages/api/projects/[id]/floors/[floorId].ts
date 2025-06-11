import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, floorId } = req.query;
  const { method, body } = req;

  if (!id || !floorId || Array.isArray(id) || Array.isArray(floorId)) {
    return res.status(400).json({ error: 'Project ID and Floor ID required' });
  }

  switch (method) {
    case 'PUT': {
      const updates = {
        ...body,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('floors')
        .update(updates)
        .eq('id', floorId)
        .eq('project_id', id)
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    case 'DELETE': {
      const { error } = await supabase
        .from('floors')
        .delete()
        .eq('id', floorId)
        .eq('project_id', id);

      if (error) return res.status(500).json({ error: error.message });
      return res.status(204).end();
    }

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
} 