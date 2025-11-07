import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from '../queries/keys';

type TaskRow = Tables<'tasks'>;

type UpdateTaskStatusVariables = {
  taskId: string;
  projectId: string;
  status: TaskRow['status'];
};

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation<TaskRow, Error, UpdateTaskStatusVariables>({
    mutationKey: [...taskKeys.all, 'update-status'],
    mutationFn: async ({ taskId, status }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.project(variables.projectId) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.task(variables.taskId) });
    },
  });
}
