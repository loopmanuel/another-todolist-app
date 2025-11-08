import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { listKeys } from './keys';

type ProjectRow = Tables<'projects'>;

export function useListQuery(listId?: string) {
  return useQuery<ProjectRow | null, Error>({
    queryKey: listKeys.list(listId ?? ''),
    enabled: Boolean(listId),
    queryFn: async () => {
      if (!listId) {
        return null;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', listId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
  });
}
