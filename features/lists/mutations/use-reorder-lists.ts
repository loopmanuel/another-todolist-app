import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TablesUpdate } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { listKeys } from '../queries/keys';

export type ReorderListsVariables = {
  ownerId: string;
  lists: Array<{
    id: string;
    sortOrder: number;
  }>;
};

export function useReorderListsMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ReorderListsVariables>({
    mutationKey: [...listKeys.all, 'reorder'],
    mutationFn: async ({ lists }) => {
      // Update each list's sort_order in parallel
      const updates = lists.map(({ id, sortOrder }) => {
        const payload: TablesUpdate<'projects'> = {
          sort_order: sortOrder,
        };

        return supabase
          .from('projects')
          .update(payload)
          .eq('id', id);
      });

      const results = await Promise.all(updates);

      // Check if any update failed
      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to reorder lists: ${errors[0].error?.message}`);
      }
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: listKeys.lists(variables.ownerId) });
    },
  });
}
