export type PriorityLevel = 0 | 1 | 2 | 3;

export const PRIORITY_CONFIG = {
  0: {
    label: 'No Priority',
    color: '#6b7280',
    bgColor: '#6b728020',
  },
  1: {
    label: 'Low',
    color: '#3b82f6',
    bgColor: '#3b82f620',
  },
  2: {
    label: 'Medium',
    color: '#f59e0b',
    bgColor: '#f59e0b20',
  },
  3: {
    label: 'High',
    color: '#ef4444',
    bgColor: '#ef444420',
  },
} as const;

export function getPriorityLabel(priority: number): string {
  if (priority in PRIORITY_CONFIG) {
    return PRIORITY_CONFIG[priority as PriorityLevel].label;
  }
  return 'No Priority';
}

export function getPriorityColor(priority: number): string {
  if (priority in PRIORITY_CONFIG) {
    return PRIORITY_CONFIG[priority as PriorityLevel].color;
  }
  return PRIORITY_CONFIG[0].color;
}

export function getPriorityBgColor(priority: number): string {
  if (priority in PRIORITY_CONFIG) {
    return PRIORITY_CONFIG[priority as PriorityLevel].bgColor;
  }
  return PRIORITY_CONFIG[0].bgColor;
}
