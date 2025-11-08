import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { labelKeys } from '../queries/keys';

type LabelRow = Tables<'labels'>;

export type CreateLabelVariables = {
  profileId: string;
  name: string;
  color?: string | null;
};

export function useCreateLabelMutation() {
  const queryClient = useQueryClient();

  return useMutation<LabelRow, Error, CreateLabelVariables>({
    mutationKey: [...labelKeys.all, 'create'],
    mutationFn: async ({ profileId, name, color }) => {
      const payload: TablesInsert<'labels'> = {
        profile_id: profileId,
        name: name.trim(),
        color: color?.trim() ? color.trim() : null,
      };

      const { data, error } = await supabase.from('labels').insert(payload).select().single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: labelKeys.user(variables.profileId) });
    },
  });
}
