import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from './keys';

type TaskRow = Tables<'tasks'>;

export type InboxTaskWithDetails = TaskRow & {
  subtaskCounts?: {
    total: number;
    completed: number;
  };
};

type UseInboxTasksParams = {
  createdBy?: string;
};

export function useInboxTasksQuery({ createdBy }: UseInboxTasksParams) {
  return useQuery<InboxTaskWithDetails[], Error>({
    queryKey: taskKeys.inbox(createdBy),
    enabled: Boolean(createdBy),
    queryFn: async () => {
      if (!createdBy) {
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
        .eq('created_by', createdBy)
        .is('deleted_at', null)
        .is('parent_id', null)
        .is('project_id', null)
        .neq('status', 'done')
        .order('due_at', { ascending: true, nullsFirst: false })
        .order('sort_order', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to include subtask counts
      const tasksWithDetails: InboxTaskWithDetails[] = (data ?? []).map((task: any) => {
        const subtasks = task.subtasks || [];
        const total = subtasks.length;
        const completed = subtasks.filter((st: any) => st.status === 'done').length;

        const { subtasks: _, ...taskWithoutSubtasks } = task;

        return {
          ...taskWithoutSubtasks,
          subtaskCounts: total > 0 ? { total, completed } : undefined,
        };
      });

      return tasksWithDetails;
    },
  });
}
