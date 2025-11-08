import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from './keys';

type TaskRow = Tables<'tasks'>;

type UseSubtasksParams = {
  parentId?: string;
  createdBy?: string;
};

export function useSubtasksQuery({ parentId, createdBy }: UseSubtasksParams) {
  return useQuery<TaskRow[], Error>({
    queryKey: [...taskKeys.subtasks(parentId), createdBy ?? 'anonymous'],
    enabled: Boolean(parentId && createdBy),
    queryFn: async () => {
      if (!parentId || !createdBy) {
        return [];
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('parent_id', parentId)
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
