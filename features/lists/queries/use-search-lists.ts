import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { listKeys } from './keys';

type ProjectRow = Tables<'projects'>;

export function useSearchListsQuery(searchQuery: string, ownerId?: string) {
  return useQuery<ProjectRow[], Error>({
    queryKey: [...listKeys.all, 'search', searchQuery, ownerId ?? 'anonymous'],
    enabled: Boolean(searchQuery.trim() && ownerId),
    queryFn: async () => {
      if (!searchQuery.trim() || !ownerId) {
        return [];
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', ownerId)
        .eq('is_archived', false)
        .is('deleted_at', null)
        .ilike('name', `%${searchQuery.trim()}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
  });
}
