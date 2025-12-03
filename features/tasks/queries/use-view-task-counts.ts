import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/utils/supabase';

import { taskKeys } from './keys';

export type ViewTaskCounts = {
  inbox: number;
  today: number;
  upcoming: number;
};

export function useViewTaskCountsQuery(userId?: string) {
  return useQuery<ViewTaskCounts, Error>({
    queryKey: [...taskKeys.all, 'view-counts', userId ?? 'anonymous'],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) {
        return { inbox: 0, today: 0, upcoming: 0 };
      }

      // Get current date boundaries
      const now = new Date();
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Fetch all non-completed, non-deleted tasks
      const { data, error } = await supabase
        .from('tasks')
        .select('id, due_at, project_id')
        .eq('created_by', userId)
        .is('deleted_at', null)
        .is('parent_id', null)
        .neq('status', 'done');

      if (error) {
        throw new Error(error.message);
      }

      const tasks = data ?? [];

      // Count tasks for each view
      const counts: ViewTaskCounts = {
        inbox: 0,
        today: 0,
        upcoming: 0,
      };

      tasks.forEach((task) => {
        // Inbox: tasks with no project_id
        if (!task.project_id) {
          counts.inbox += 1;
        }

        // Today: tasks with due_at before end of today
        if (task.due_at && new Date(task.due_at) < endOfToday) {
          counts.today += 1;
        }

        // Upcoming: tasks with due_at >= start of today
        if (task.due_at && new Date(task.due_at) >= startOfToday) {
          counts.upcoming += 1;
        }
      });

      return counts;
    },
  });
}
