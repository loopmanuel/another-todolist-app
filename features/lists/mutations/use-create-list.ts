import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import type { CreateListValues } from '../validation/create-list-schema';
import { listKeys } from '../queries/keys';

type CreateListVariables = CreateListValues & {
  ownerId: string;
};

type ProjectRow = Tables<'projects'>;

export function useCreateListMutation() {
  const queryClient = useQueryClient();

  return useMutation<ProjectRow, Error, CreateListVariables>({
    mutationKey: [...listKeys.all, 'create'],
    mutationFn: async ({ ownerId, name, color }) => {
      const payload: TablesInsert<'projects'> = {
        name: name.trim(),
        owner_id: ownerId,
        color: color?.trim() ? color.trim() : null,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: listKeys.lists(variables.ownerId) });
    },
  });
}
