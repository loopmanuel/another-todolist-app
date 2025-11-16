import React, { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Checkbox } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { Tables } from '@/supabase/database.types';
import { useUpdateTaskStatusMutation } from '@/features/tasks/mutations/use-update-task-status';
import { useAuthStore } from '@/store/auth-store';
import { getPriorityColor, getPriorityLabel } from '@/features/tasks/utils/priority';
import dayjs from 'dayjs';

export type TaskRow = Tables<'tasks'>;

type TaskCardProps = {
  task: TaskRow & {
    subtaskCounts?: {
      total: number;
      completed: number;
    };
  };
  isDisabled?: boolean;
  onPress?: (task: TaskRow) => void;
  onLongPress?: () => void;
  isActive?: boolean;
};

export function formatDueLabel(dateString?: string | null) {
  if (!dateString) {
    return 'No date';
  }

  return dayjs(dateString).format('MMM D, YYYY');
}

export function formatPriority(priority?: number | null) {
  if (!priority || priority <= 0) {
    return 'No priority';
  }

  return `Priority ${priority}`;
}

export function TaskCard({ task, isDisabled, onPress, onLongPress, isActive }: TaskCardProps) {
  const isCompleted = task.status === 'done';
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { mutateAsync: updateTaskStatus } = useUpdateTaskStatusMutation();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleStatus = async (nextSelected: boolean) => {
    if (!user?.id) {
      return;
    }

    setIsUpdating(true);
    try {
      await updateTaskStatus({
        taskId: task.id,
        projectId: task.project_id,
        parentId: task.parent_id ?? null,
        status: nextSelected ? 'done' : 'todo',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update task.';
      Alert.alert('Update failed', message);
    } finally {
      setIsUpdating(false);
    }
  };

  const checkboxDisabled = isDisabled || isUpdating;

  return (
    <Pressable
      className={cn(
        'border-border flex flex-row gap-4 rounded-3xl border bg-white p-4',
        isActive && 'opacity-90 shadow-lg'
      )}
      onPress={() => (onPress ? onPress(task) : undefined)}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}>
      <Checkbox
        isSelected={isCompleted}
        isDisabled={checkboxDisabled}
        onSelectedChange={(next) => {
          void handleToggleStatus(next);
        }}
        className={'border border-gray-300'}
      />
      <View className={cn('flex-1', isCompleted && 'opacity-50')}>
        <Text className={cn('text-lg font-medium', isCompleted && 'text-gray-600 line-through')}>
          {task.title}
        </Text>
        <View className="mt-2 flex flex-row flex-wrap items-center gap-3">
          {task.priority > 0 ? (
            <View className="flex w-fit flex-row items-center justify-center gap-1 py-1">
              <Ionicons
                name={task.priority > 0 ? 'flag' : 'flag-outline'}
                size={14}
                color={task.priority > 0 ? getPriorityColor(task.priority) : undefined}
              />

              <Text
                className="text-sm"
                style={{
                  color: task.priority > 0 ? getPriorityColor(task.priority) : undefined,
                }}>
                {getPriorityLabel(task.priority)}
              </Text>
            </View>
          ) : null}

          {task.due_at ? (
            <View className="flex w-fit flex-row items-center justify-center gap-1 py-1">
              <Ionicons name={'calendar-outline'} size={14} />
              <Text className="text-sm">{formatDueLabel(task.due_at)}</Text>
            </View>
          ) : null}

          {task.subtaskCounts ? (
            <View className="flex w-fit flex-row items-center justify-center gap-1 py-1">
              <Ionicons name={'list-outline'} size={14} />
              <Text className="text-sm">
                {task.subtaskCounts.completed}/{task.subtaskCounts.total}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
