import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/utils/supabase';

import { taskKeys } from './keys';

type ProjectTaskCount = {
  project_id: string;
  uncompleted_count: number;
};

export function useProjectTaskCountsQuery(userId?: string) {
  return useQuery<Record<string, number>, Error>({
    queryKey: [...taskKeys.all, 'project-counts', userId ?? 'anonymous'],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) {
        return {};
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('project_id')
        .eq('created_by', userId)
        .is('deleted_at', null)
        .is('parent_id', null)
        .neq('status', 'done');

      if (error) {
        throw new Error(error.message);
      }

      // Count tasks by project_id
      const counts: Record<string, number> = {};
      (data ?? []).forEach((task) => {
        if (task.project_id) {
          counts[task.project_id] = (counts[task.project_id] || 0) + 1;
        }
      });

      return counts;
    },
  });
}
