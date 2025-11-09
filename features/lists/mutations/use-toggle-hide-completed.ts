import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesUpdate } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { listKeys } from '../queries/keys';

type ProjectRow = Tables<'projects'>;

export type ToggleHideCompletedVariables = {
  listId: string;
  ownerId: string;
  hideCompleted: boolean;
};

export function useToggleHideCompletedMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProjectRow, Error, ToggleHideCompletedVariables>({
    mutationKey: [...listKeys.all, 'toggleHideCompleted'],
    mutationFn: async ({ listId, hideCompleted }) => {
      const payload: TablesUpdate<'projects'> = {
        hide_completed_tasks: hideCompleted,
      };

      const { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', listId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: listKeys.lists(variables.ownerId) });
      void queryClient.invalidateQueries({ queryKey: listKeys.list(variables.listId) });
    },
  });
}
