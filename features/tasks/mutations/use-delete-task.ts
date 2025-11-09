import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TablesUpdate } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from '../queries/keys';

export type DeleteTaskVariables = {
  taskId: string;
  projectId: string;
  parentId?: string | null;
};

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteTaskVariables>({
    mutationKey: [...taskKeys.all, 'delete'],
    mutationFn: async ({ taskId }) => {
      const payload: TablesUpdate<'tasks'> = {
        deleted_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('tasks')
        .update(payload)
        .eq('id', taskId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.task(variables.taskId) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.project(variables.projectId) });

      // If this was a subtask, invalidate parent task queries
      if (variables.parentId) {
        void queryClient.invalidateQueries({ queryKey: taskKeys.task(variables.parentId) });
        void queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(variables.parentId) });
      }

      // Invalidate today's tasks as well
      void queryClient.invalidateQueries({ queryKey: [...taskKeys.all, 'today'] });
    },
  });
}
