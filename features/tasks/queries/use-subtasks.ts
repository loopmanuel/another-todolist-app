import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from './keys';

type TaskRow = Tables<'tasks'>;

export type SubtaskWithCounts = TaskRow & {
  subtaskCounts?: {
    total: number;
    completed: number;
  };
};

type UseSubtasksParams = {
  parentId?: string;
  createdBy?: string;
};

export function useSubtasksQuery({ parentId, createdBy }: UseSubtasksParams) {
  return useQuery<SubtaskWithCounts[], Error>({
    queryKey: [...taskKeys.subtasks(parentId), createdBy ?? 'anonymous'],
    enabled: Boolean(parentId && createdBy),
    queryFn: async () => {
      if (!parentId || !createdBy) {
        return [];
      }

      const { data, error } = await supabase
        .from('tasks')
        .select(
          `
          *,
          subtasks:tasks!parent_id(id, status)
        `
        )
        .eq('parent_id', parentId)
        .eq('created_by', createdBy)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to include nested subtask counts
      const subtasksWithCounts: SubtaskWithCounts[] = (data ?? []).map((task: any) => {
        const nestedSubtasks = task.subtasks || [];
        const total = nestedSubtasks.length;
        const completed = nestedSubtasks.filter((st: any) => st.status === 'done').length;

        const { subtasks: _, ...taskWithoutSubtasks } = task;

        return {
          ...taskWithoutSubtasks,
          subtaskCounts: total > 0 ? { total, completed } : undefined,
        };
      });

      return subtasksWithCounts;
    },
  });
}
