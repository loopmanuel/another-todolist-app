import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';

import type { TablesUpdate } from '@/supabase/database.types';
import { supabase } from '@/utils/supabase';

import { taskKeys } from '../queries/keys';
import type { TaskWithSubtaskCounts } from '../queries/use-tasks';
import type { SubtaskWithCounts } from '../queries/use-subtasks';

export type ReorderTasksVariables = {
  projectId: string | null;
  parentTaskId?: string | null;
  tasks: Array<{
    id: string;
    sortOrder: number;
  }>;
};

type ReorderTasksContext = {
  previousProjectQueries: Array<[QueryKey, TaskWithSubtaskCounts[] | undefined]>;
  previousSubtaskQueries: Array<[QueryKey, SubtaskWithCounts[] | undefined]>;
};

export function useReorderTasksMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ReorderTasksVariables, ReorderTasksContext>({
    mutationKey: [...taskKeys.all, 'reorder'],
    mutationFn: async ({ tasks }) => {
      // Update each task's sort_order in parallel
      const updates = tasks.map(({ id, sortOrder }) => {
        const payload: TablesUpdate<'tasks'> = {
          sort_order: sortOrder,
        };

        return supabase
          .from('tasks')
          .update(payload)
          .eq('id', id);
      });

      const results = await Promise.all(updates);

      // Check if any update failed
      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to reorder tasks: ${errors[0].error?.message}`);
      }
    },
    onMutate: async (variables) => {
      const reorderMap = new Map(variables.tasks.map((task) => [task.id, task.sortOrder]));
      const applyReorder = <T extends { id: string; sort_order: number | null; created_at?: string | null }>(
        items: T[] | undefined
      ) => {
        if (!items) return items;

        return [...items]
          .map((item) => {
            const sortOrder = reorderMap.get(item.id);
            return sortOrder === undefined ? item : { ...item, sort_order: sortOrder };
          })
          .sort((a, b) => {
            const aOrder = a.sort_order ?? Number.NEGATIVE_INFINITY;
            const bOrder = b.sort_order ?? Number.NEGATIVE_INFINITY;
            if (aOrder !== bOrder) return aOrder - bOrder;
            const aCreated = a.created_at ?? '';
            const bCreated = b.created_at ?? '';
            if (aCreated === bCreated) return 0;
            return aCreated < bCreated ? -1 : 1;
          });
      };

      const isProjectQuery = (queryKey: readonly unknown[]) =>
        Boolean(variables.projectId) &&
        queryKey[0] === taskKeys.all[0] &&
        queryKey[1] === 'project' &&
        queryKey[2] === variables.projectId;

      const isSubtaskQuery = (queryKey: readonly unknown[]) =>
        Boolean(variables.parentTaskId) &&
        queryKey[0] === taskKeys.all[0] &&
        queryKey[1] === 'subtasks' &&
        queryKey[2] === variables.parentTaskId;

      const previousProjectQueries = variables.projectId
        ? queryClient.getQueriesData<TaskWithSubtaskCounts[]>({
            predicate: (query) => isProjectQuery(query.queryKey),
          })
        : [];

      const previousSubtaskQueries = variables.parentTaskId
        ? queryClient.getQueriesData<SubtaskWithCounts[]>({
            predicate: (query) => isSubtaskQuery(query.queryKey),
          })
        : [];

      await Promise.all([
        variables.projectId
          ? queryClient.cancelQueries({
              predicate: (query) => isProjectQuery(query.queryKey),
            })
          : Promise.resolve(),
        variables.parentTaskId
          ? queryClient.cancelQueries({
              predicate: (query) => isSubtaskQuery(query.queryKey),
            })
          : Promise.resolve(),
      ]);

      if (variables.projectId) {
        queryClient.setQueriesData<TaskWithSubtaskCounts[]>(
          {
            predicate: (query) => isProjectQuery(query.queryKey),
          },
          (old) => applyReorder(old)
        );
      }

      if (variables.parentTaskId) {
        queryClient.setQueriesData<SubtaskWithCounts[]>(
          {
            predicate: (query) => isSubtaskQuery(query.queryKey),
          },
          (old) => applyReorder(old)
        );
      }

      return { previousProjectQueries, previousSubtaskQueries };
    },
    onError: (_error, _variables, context) => {
      context?.previousProjectQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousSubtaskQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
}
