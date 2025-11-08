import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from '../queries/keys';

type TaskRow = Tables<'tasks'>;

export type CreateTaskVariables = {
  createdBy: string;
  projectId: string;
  parentId?: string;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  labelIds?: string[];
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
    mutationFn: async ({ createdBy, projectId, parentId, title, description, dueDate, labelIds }) => {
      const payload: TablesInsert<'tasks'> = {
        created_by: createdBy,
        project_id: projectId,
        parent_id: parentId ?? null,
        title: title.trim(),
        description: description?.trim() ? description.trim() : null,
        due_at: toDueAt(dueDate),
        status: 'todo',
      };

      const { data, error } = await supabase.from('tasks').insert(payload).select().single();

      if (error) {
        throw new Error(error.message);
      }

      // Insert task-label relationships if any labels are selected
      if (labelIds && labelIds.length > 0) {
        const taskLabelPayload = labelIds.map((labelId) => ({
          task_id: data.id,
          label_id: labelId,
        }));

        const { error: labelError } = await supabase.from('task_labels').insert(taskLabelPayload);

        if (labelError) {
          // If label insertion fails, we could delete the task or just log the error
          // For now, we'll throw an error
          throw new Error(`Task created but labels failed: ${labelError.message}`);
        }
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.project(variables.projectId) });
      if (variables.parentId) {
        void queryClient.invalidateQueries({ queryKey: taskKeys.task(variables.parentId) });
        void queryClient.invalidateQueries({ queryKey: taskKeys.subtasks(variables.parentId) });
      }
    },
  });
}
