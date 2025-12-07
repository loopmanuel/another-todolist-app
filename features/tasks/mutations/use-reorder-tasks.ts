import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TablesUpdate } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from '../queries/keys';

export type ReorderTasksVariables = {
  projectId: string | null;
  parentTaskId?: string | null;
  tasks: Array<{
    id: string;
    sortOrder: number;
  }>;
};

export function useReorderTasksMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ReorderTasksVariables>({
    mutationKey: [...taskKeys.all, 'reorder'],
    mutationFn: async ({ tasks }) => {
      // Update each task's sort_order in parallel
      const updates = tasks.map(({ id, sortOrder }) => {
        const payload: TablesUpdate<'tasks'> = {
          sort_order: sortOrder,
        };

        return supabase
          .from('tasks')
          .update(payload)
          .eq('id', id);
      });

      const results = await Promise.all(updates);

      // Check if any update failed
      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to reorder tasks: ${errors[0].error?.message}`);
      }
    },
    onSuccess: (_data, variables) => {
      if (variables.projectId) {
        void queryClient.invalidateQueries({ queryKey: taskKeys.project(variables.projectId) });
      }

      // If reordering subtasks, also invalidate the parent task query
      if (variables.parentTaskId) {
        void queryClient.invalidateQueries({ queryKey: taskKeys.task(variables.parentTaskId) });
        void queryClient.invalidateQueries({
          queryKey: taskKeys.subtasks(variables.parentTaskId)
        });
      }
    },
  });
}
