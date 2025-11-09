import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from './keys';

type TaskRow = Tables<'tasks'>;

export function useSearchTasksQuery(searchQuery: string, createdBy?: string) {
  return useQuery<TaskRow[], Error>({
    queryKey: [...taskKeys.all, 'search', searchQuery, createdBy ?? 'anonymous'],
    enabled: Boolean(searchQuery.trim() && createdBy),
    queryFn: async () => {
      if (!searchQuery.trim() || !createdBy) {
        return [];
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', createdBy)
        .is('deleted_at', null)
        .or(`title.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw new Error(error.message);
      }

      return data ?? [];
    },
  });
}
