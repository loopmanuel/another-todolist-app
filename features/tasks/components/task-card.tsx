import React, { useState, useEffect, useRef } from 'react';
import { Alert, Pressable, View, TouchableOpacity } from 'react-native';
import { Checkbox } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';

import { toast } from 'sonner-native';

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
  shouldAnimateOnComplete?: boolean;
  showProject?: boolean;
  projectInfo?: {
    name: string;
    color?: string | null;
    icon?: string | null;
  };
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

export function TaskCard({
  task,
  isDisabled,
  onPress,
  onLongPress,
  isActive,
  shouldAnimateOnComplete = true,
  showProject = false,
  projectInfo,
}: TaskCardProps) {
  const { user } = useAuthStore((state) => ({ user: state.user }));

  const { mutateAsync: updateTaskStatus } = useUpdateTaskStatusMutation();

  const [isUpdating, setIsUpdating] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(task.status === 'done');

  const [toastId, setToastId] = useState<string | number>('');

  // Animated values for micro animation
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  const handleUndo = async () => {
    if (!user?.id) return;

    // Cancel ongoing animations
    cancelAnimation(opacity);
    cancelAnimation(scale);
    cancelAnimation(translateX);

    // Reset animation values immediately
    opacity.value = 1;
    scale.value = 1;
    translateX.value = 0;

    setIsAnimatingOut(false);
    setIsCompleted(false);
    setIsUpdating(true);

    try {
      await updateTaskStatus({
        taskId: task.id,
        projectId: task.project_id,
        parentId: task.parent_id ?? null,
        status: 'todo',
        delayInvalidation: undefined,
      });

      toast.dismiss();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to undo.';
      Alert.alert('Undo failed', message);
      setIsCompleted(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (nextSelected: boolean) => {
    if (!user?.id) {
      return;
    }

    setIsCompleted(nextSelected);
    setIsUpdating(true);

    // Trigger animation when marking as done
    if (nextSelected && shouldAnimateOnComplete) {
      setIsAnimatingOut(true);
      // Brief delay to show checked state, then animate out
      opacity.value = withDelay(400, withTiming(0, { duration: 400 }));
      scale.value = withSequence(
        withTiming(0.98, { duration: 150 }),
        withDelay(250, withTiming(0.95, { duration: 400 }))
      );
      translateX.value = withDelay(400, withTiming(-100, { duration: 400 }));
    }

    try {
      await updateTaskStatus({
        taskId: task.id,
        projectId: task.project_id,
        parentId: task.parent_id ?? null,
        status: nextSelected ? 'done' : 'todo',
        // Delay query invalidation if animation is playing (400ms delay + 400ms animation + 50ms buffer)
        delayInvalidation: nextSelected && shouldAnimateOnComplete ? 850 : undefined,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update task.';
      Alert.alert('Update failed', message);
      // Reset animation on error
      setIsAnimatingOut(false);
      opacity.value = withTiming(1, { duration: 100 });
      scale.value = withTiming(1, { duration: 100 });
      translateX.value = withTiming(0, { duration: 100 });
      setIsCompleted(!nextSelected);
      setIsUpdating(false);
      return;
    }

    // Show toast with undo button when marking as complete (after successful update)
    if (nextSelected) {
      const newToastId = toast.success('Undo', {
        description: 'Completed',
        duration: 4000,
        action: {
          label: 'Undo',
          onClick: () => handleUndo(),
        },
      });

      setToastId(newToastId);
    }

    setIsUpdating(false);
  };

  // Reset animation when task becomes uncompleted
  useEffect(() => {
    if (!isCompleted && isAnimatingOut) {
      setIsAnimatingOut(false);
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
      translateX.value = withTiming(0, { duration: 300 });
    }
  }, [isCompleted, isAnimatingOut, opacity, scale, translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }, { translateX: translateX.value }],
    };
  });

  const checkboxDisabled = isDisabled || isUpdating;

  return (
    <Animated.View style={animatedStyle}>
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

            {showProject && projectInfo ? (
              <View
                className="flex w-fit flex-row items-center justify-center gap-1 rounded-full px-2 py-1"
                style={{
                  backgroundColor: projectInfo.color
                    ? `${projectInfo.color}20`
                    : 'rgba(107, 114, 128, 0.1)',
                }}>
                {projectInfo.icon ? (
                  <Text className="text-xs">{projectInfo.icon}</Text>
                ) : (
                  <Ionicons name={'file-tray-outline'} size={12} />
                )}
                <Text
                  className="text-xs font-medium"
                  style={{
                    color: projectInfo.color || '#6b7280',
                  }}>
                  {projectInfo.name}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
