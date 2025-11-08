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

type UseTasksParams = {
  projectId?: string;
  createdBy?: string;
};

export function useTasksQuery({ projectId, createdBy }: UseTasksParams) {
  return useQuery<TaskWithSubtaskCounts[], Error>({
    queryKey: [...taskKeys.project(projectId), createdBy ?? 'anonymous'],
    enabled: Boolean(projectId && createdBy),
    queryFn: async () => {
      if (!projectId || !createdBy) {
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
        .eq('project_id', projectId)
        .eq('created_by', createdBy)
        .is('deleted_at', null)
        .is('parent_id', null)
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
