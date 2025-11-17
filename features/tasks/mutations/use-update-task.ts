import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesUpdate } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from '../queries/keys';
import { listKeys } from '@/features/lists/queries/keys';

type TaskRow = Tables<'tasks'>;

export type UpdateTaskVariables = {
  taskId: string;
  projectId: string;
  payload: Partial<Pick<TablesUpdate<'tasks'>, 'title' | 'description' | 'due_at' | 'priority' | 'project_id'>>;
};

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation<TaskRow, Error, UpdateTaskVariables>({
    mutationKey: [...taskKeys.all, 'update'],
    mutationFn: async ({ taskId, payload }) => {
      const updatePayload: TablesUpdate<'tasks'> = {
        ...payload,
        title: payload.title?.trim(),
        description: payload.description !== undefined
          ? (payload.description?.trim() || null)
          : undefined,
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updatePayload)
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.task(variables.taskId) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.project(variables.projectId) });

      // If project changed, invalidate the new project's queries and all lists
      if (variables.payload.project_id && variables.payload.project_id !== variables.projectId) {
        void queryClient.invalidateQueries({ queryKey: taskKeys.project(variables.payload.project_id) });
        // Invalidate all lists queries to refresh task counts everywhere
        void queryClient.invalidateQueries({ queryKey: listKeys.all });
        // Invalidate all task queries (including project-counts used on index page)
        void queryClient.invalidateQueries({ queryKey: taskKeys.all });
      }
    },
  });
}
