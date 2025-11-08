export const labelKeys = {
  all: ['labels'] as const,
  user: (userId?: string) => [...labelKeys.all, 'user', userId ?? 'unknown'] as const,
  label: (labelId: string) => [...labelKeys.all, 'detail', labelId] as const,
};

export type LabelQueryKey =
  | ReturnType<typeof labelKeys.user>
  | ReturnType<typeof labelKeys.label>;
