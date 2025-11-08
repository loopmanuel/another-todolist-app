import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesUpdate } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { listKeys } from '../queries/keys';

type ProjectRow = Tables<'projects'>;

export type UpdateListVariables = {
  listId: string;
  ownerId: string;
  name?: string;
  icon?: string | null;
  color?: string | null;
};

export function useUpdateListMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProjectRow, Error, UpdateListVariables>({
    mutationKey: [...listKeys.all, 'update'],
    mutationFn: async ({ listId, name, icon, color }) => {
      const payload: TablesUpdate<'projects'> = {};

      if (name !== undefined) {
        payload.name = name.trim();
      }
      if (icon !== undefined) {
        payload.icon = icon?.trim() ? icon.trim() : null;
      }
      if (color !== undefined) {
        payload.color = color?.trim() ? color.trim() : null;
      }

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
