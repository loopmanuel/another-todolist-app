import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { labelKeys } from './keys';

type LabelRow = Tables<'labels'>;

type UseLabelsParams = {
  userId?: string;
};

export function useLabelsQuery({ userId }: UseLabelsParams) {
  return useQuery<LabelRow[], Error>({
    queryKey: labelKeys.user(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .eq('profile_id', userId)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
  });
}
