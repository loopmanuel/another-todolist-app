import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/utils/supabase';

import { taskKeys } from '../queries/keys';

export type UpdateTaskLabelsVariables = {
  taskId: string;
  projectId: string | null;
  labelIds: string[];
};

export function useUpdateTaskLabelsMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UpdateTaskLabelsVariables>({
    mutationKey: [...taskKeys.all, 'update-labels'],
    mutationFn: async ({ taskId, labelIds }) => {
      // First, delete all existing labels for this task
      const { error: deleteError } = await supabase
        .from('task_labels')
        .delete()
        .eq('task_id', taskId);

      if (deleteError) {
        throw new Error(`Failed to remove old labels: ${deleteError.message}`);
      }

      // Then, insert the new labels if any
      if (labelIds.length > 0) {
        const taskLabelPayload = labelIds.map((labelId) => ({
          task_id: taskId,
          label_id: labelId,
        }));

        const { error: insertError } = await supabase
          .from('task_labels')
          .insert(taskLabelPayload);

        if (insertError) {
          throw new Error(`Failed to add new labels: ${insertError.message}`);
        }
      }
    },
    onSuccess: (_data, variables) => {
      // Invalidate the task query
      void queryClient.invalidateQueries({ queryKey: taskKeys.task(variables.taskId) });

      // Invalidate the task labels query specifically
      void queryClient.invalidateQueries({
        queryKey: [...taskKeys.task(variables.taskId), 'labels']
      });

      if (variables.projectId) {
        void queryClient.invalidateQueries({ queryKey: taskKeys.project(variables.projectId) });
      }
    },
  });
}
