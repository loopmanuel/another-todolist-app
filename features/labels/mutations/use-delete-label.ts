import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner-native';

import { supabase } from '@/utils/supabase';

import { labelKeys } from '../queries/keys';

export type DeleteLabelVariables = {
  id: string;
  profileId: string;
};

export function useDeleteLabelMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteLabelVariables>({
    mutationKey: [...labelKeys.all, 'delete'],
    mutationFn: async ({ id }) => {
      const { error } = await supabase.from('labels').delete().eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (_data, variables) => {
      toast.success('Label deleted');
      void queryClient.invalidateQueries({ queryKey: labelKeys.user(variables.profileId) });
    },
    onError: (error) => {
      toast.error('Failed to delete label', {
        description: error.message,
      });
    },
  });
}
