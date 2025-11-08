export const taskKeys = {
  all: ['tasks'] as const,
  project: (projectId?: string) => [...taskKeys.all, 'project', projectId ?? 'unknown'] as const,
  task: (taskId: string) => [...taskKeys.all, 'detail', taskId] as const,
  subtasks: (parentId?: string) => [...taskKeys.all, 'subtasks', parentId ?? 'root'] as const,
};

export type TaskQueryKey =
  | ReturnType<typeof taskKeys.project>
  | ReturnType<typeof taskKeys.task>
  | ReturnType<typeof taskKeys.subtasks>;
