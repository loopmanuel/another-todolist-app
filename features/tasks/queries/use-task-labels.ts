import { useQuery } from '@tanstack/react-query';

import type { Tables } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from './keys';

type LabelRow = Tables<'labels'>;

type UseTaskLabelsParams = {
  taskId?: string;
};

export function useTaskLabelsQuery({ taskId }: UseTaskLabelsParams) {
  return useQuery<LabelRow[], Error>({
    queryKey: [...taskKeys.task(taskId ?? ''), 'labels'],
    enabled: Boolean(taskId),
    queryFn: async () => {
      if (!taskId) {
        return [];
      }

      const { data, error } = await supabase
        .from('task_labels')
        .select('label_id, labels(*)')
        .eq('task_id', taskId);

      if (error) {
        throw new Error(error.message);
      }

      // Extract the labels from the join
      return (data ?? []).map((item: any) => item.labels).filter(Boolean);
    },
  });
}
