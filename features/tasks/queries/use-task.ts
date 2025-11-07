import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from './keys';

type TaskRow = Tables<'tasks'>;

type UseTaskQueryParams = {
  taskId?: string;
  createdBy?: string;
};

export function useTaskQuery({ taskId, createdBy }: UseTaskQueryParams) {
  const queryKey = taskId
    ? [...taskKeys.task(taskId), createdBy ?? 'anonymous']
    : [...taskKeys.all, 'detail', 'unknown', createdBy ?? 'anonymous'];

  return useQuery<TaskRow | null, Error>({
    queryKey,
    enabled: Boolean(taskId && createdBy),
    queryFn: async () => {
      if (!taskId || !createdBy) {
        return null;
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .eq('created_by', createdBy)
        .is('deleted_at', null)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      return data ?? null;
    },
  });
}
