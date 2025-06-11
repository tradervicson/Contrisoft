import { useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useProjectStore } from '../store/projectStore';

export const useProjectSubscription = (projectId: string | undefined) => {
  const { setStatus, setCostSummary } = useProjectStore();

  useEffect(() => {
    if (!projectId) return;
    const channel = supabase
      .channel(`projects:id=${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        (payload) => {
          // @ts-ignore
          setStatus(payload.new.status);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'project_costs', filter: `project_id=eq.${projectId}` },
        (payload) => {
          // @ts-ignore
          setCostSummary(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);
}; 