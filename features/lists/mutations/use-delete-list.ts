import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TablesUpdate } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { listKeys } from '../queries/keys';

export type DeleteListVariables = {
  listId: string;
  ownerId: string;
};

export function useDeleteListMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteListVariables>({
    mutationKey: [...listKeys.all, 'delete'],
    mutationFn: async ({ listId }) => {
      const payload: TablesUpdate<'projects'> = {
        deleted_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', listId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: listKeys.lists(variables.ownerId) });
      void queryClient.invalidateQueries({ queryKey: listKeys.list(variables.listId) });
    },
  });
}
