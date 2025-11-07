import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from './keys';

type TaskRow = Tables<'tasks'>;

type UseTasksParams = {
  projectId?: string;
  createdBy?: string;
};

export function useTasksQuery({ projectId, createdBy }: UseTasksParams) {
  return useQuery<TaskRow[], Error>({
    queryKey: [...taskKeys.project(projectId), createdBy ?? 'anonymous'],
    enabled: Boolean(projectId && createdBy),
    queryFn: async () => {
      if (!projectId || !createdBy) {
        return [];
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .eq('created_by', createdBy)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
  });
}
