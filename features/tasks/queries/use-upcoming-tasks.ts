import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from './keys';

type TaskRow = Tables<'tasks'>;

export type TaskWithSubtaskCounts = TaskRow & {
  subtaskCounts?: {
    total: number;
    completed: number;
  };
};

type UseUpcomingTasksParams = {
  createdBy?: string;
};

export function useUpcomingTasksQuery({ createdBy }: UseUpcomingTasksParams) {
  return useQuery<TaskWithSubtaskCounts[], Error>({
    queryKey: [...taskKeys.all, 'upcoming', createdBy ?? 'anonymous'],
    enabled: !!createdBy,
    queryFn: async () => {
      if (!createdBy) {
        return [];
      }

      // Get start of today (include today and future tasks)
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
        .gte('due_at', startOfToday.toISOString())
        .order('due_at', { ascending: true, nullsFirst: false })
        .order('sort_order', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Transform data to include subtask counts
      const tasksWithCounts: TaskWithSubtaskCounts[] = (data ?? []).map((task: any) => {
        const subtasks = task.subtasks || [];
        const total = subtasks.length;
        const completed = subtasks.filter((st: any) => st.status === 'done').length;

        const { subtasks: _, ...taskWithoutSubtasks } = task;

        return {
          ...taskWithoutSubtasks,
          subtaskCounts: total > 0 ? { total, completed } : undefined,
        };
      });

      return tasksWithCounts;
    },
  });
}
