import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from '../queries/keys';

type TaskRow = Tables<'tasks'>;

export type CreateTaskVariables = {
  createdBy: string;
  projectId: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
};

function toDueAt(dueDate?: string | null) {
  if (!dueDate || !dueDate.trim()) {
    return null;
  }

  // Store as UTC midnight to keep date-only semantics consistent.
  return `${dueDate}T00:00:00.000Z`;
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation<TaskRow, Error, CreateTaskVariables>({
    mutationKey: [...taskKeys.all, 'create'],
    mutationFn: async ({ createdBy, projectId, title, description, dueDate }) => {
      const payload: TablesInsert<'tasks'> = {
        created_by: createdBy,
        project_id: projectId,
        title: title.trim(),
        description: description?.trim() ? description.trim() : null,
        due_at: toDueAt(dueDate),
        status: 'todo',
      };

      const { data, error } = await supabase.from('tasks').insert(payload).select().single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.project(variables.projectId) });
    },
  });
}
