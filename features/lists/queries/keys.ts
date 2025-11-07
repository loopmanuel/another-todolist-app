export const listKeys = {
  all: ['lists'] as const,
  lists: (ownerId?: string) => [...listKeys.all, ownerId ?? 'all'] as const,
  list: (id: string) => [...listKeys.all, 'detail', id] as const,
};

export type ListQueryKey = ReturnType<typeof listKeys.lists> | ReturnType<typeof listKeys.list>;
