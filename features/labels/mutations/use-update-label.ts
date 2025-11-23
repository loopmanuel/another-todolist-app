import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

import type { Tables, TablesUpdate } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { labelKeys } from '../queries/keys';

type LabelRow = Tables<'labels'>;

export type UpdateLabelVariables = {
  id: string;
  profileId: string;
  name: string;
  color?: string | null;
};

export function useUpdateLabelMutation() {
  const queryClient = useQueryClient();

  return useMutation<LabelRow, Error, UpdateLabelVariables>({
    mutationKey: [...labelKeys.all, 'update'],
    mutationFn: async ({ id, name, color }) => {
      const payload: TablesUpdate<'labels'> = {
        name: name.trim(),
        color: color?.trim() ? color.trim() : null,
      };

      const { data, error } = await supabase
        .from('labels')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      toast.success('Label updated');
      void queryClient.invalidateQueries({ queryKey: labelKeys.user(variables.profileId) });
    },
    onError: (error) => {
      toast.error('Failed to update label', {
        description: error.message,
      });
    },
  });
}
