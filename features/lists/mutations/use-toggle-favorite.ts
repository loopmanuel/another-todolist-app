import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { listKeys } from '../queries/keys';

type ProjectRow = Tables<'projects'>;

export type ToggleFavoriteVariables = {
  listId: string;
  ownerId: string;
  isFavorite: boolean;
};

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProjectRow, Error, ToggleFavoriteVariables>({
    mutationKey: [...listKeys.all, 'toggle-favorite'],
    mutationFn: async ({ listId, isFavorite }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ is_favorite: isFavorite })
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
