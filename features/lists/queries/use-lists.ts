import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { listKeys } from './keys';

type ProjectRow = Tables<'projects'>;

export function useListsQuery(ownerId?: string) {
  return useQuery<ProjectRow[], Error>({
    queryKey: listKeys.lists(ownerId),
    enabled: Boolean(ownerId),
    queryFn: async () => {
      if (!ownerId) {
        return [];
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('is_archived', false)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
  });
}
