import React from 'react';
import { Pressable, View } from 'react-native';
import { Checkbox } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { Tables } from '@/supabase/database.types';

export type TaskRow = Tables<'tasks'>;

type TaskCardProps = {
  task: TaskRow;
  isDisabled?: boolean;
  onPress?: (task: TaskRow) => void;
  onToggleStatus?: (task: TaskRow, nextSelected: boolean) => void;
};

export function formatDueLabel(dateString?: string | null) {
  if (!dateString) {
    return 'No date';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'No date';
  }

  return date.toLocaleDateString();
}

export function formatPriority(priority?: number | null) {
  if (!priority || priority <= 0) {
    return 'No priority';
  }

  return `Priority ${priority}`;
}

export function TaskCard({ task, isDisabled, onPress, onToggleStatus }: TaskCardProps) {
  const isCompleted = task.status === 'done';

  return (
    <Pressable
      className="flex flex-row gap-4 rounded-lg bg-white p-4"
      onPress={() => (onPress ? onPress(task) : undefined)}
      disabled={!onPress}>
      <Checkbox
        isSelected={isCompleted}
        isDisabled={isDisabled}
        onSelectedChange={(next) => {
          if (onToggleStatus) {
            onToggleStatus(task, next);
          }
        }}
      />
      <View className={cn('flex-1', isCompleted && 'opacity-50')}>
        <Text className={cn('text-lg font-medium', isCompleted && 'text-gray-600 line-through')}>
          {task.title}
        </Text>
        <View className="mt-2 flex flex-row flex-wrap items-center gap-3">
          {task.priority > 0 ? (
            <View className="flex w-fit flex-row items-center justify-center gap-1 p-1">
              <Text className="text-sm text-red-600">Priority {task.priority}</Text>
            </View>
          ) : null}

          {task.due_at ? (
            <View className="flex w-fit flex-row items-center justify-center gap-1 p-1">
              <Ionicons name={'calendar-outline'} size={14} />
              <Text className="text-sm">{formatDueLabel(task.due_at)}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
