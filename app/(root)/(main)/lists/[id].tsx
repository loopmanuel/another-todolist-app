import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';

import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Text } from '@/components/ui/text';
import { Button, Checkbox } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { Tables } from '@/supabase/database.types';
import { useTasksQuery } from '@/features/tasks/queries/use-tasks';
import { useUpdateTaskStatusMutation } from '@/features/tasks/mutations/use-update-task-status';
import { useAuthStore } from '@/store/auth-store';

type TaskRow = Tables<'tasks'>;

function formatDueLabel(dateString?: string | null) {
  if (!dateString) {
    return 'No date';
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'No date';
  }

  return date.toLocaleDateString();
}

export default function ListDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const projectId = useMemo(() => {
    if (!params.id) {
      return undefined;
    }
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params.id]);

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const {
    data: tasks = [],
    isLoading,
    isRefetching,
    refetch,
  } = useTasksQuery({ projectId, createdBy: user?.id });
  const { mutateAsync: updateTaskStatus } = useUpdateTaskStatusMutation();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const handleToggleTask = useCallback(
    async (task: TaskRow, nextSelected: boolean) => {
      if (!user?.id) {
        return;
      }
      setUpdatingTaskId(task.id);
      try {
        await updateTaskStatus({
          taskId: task.id,
          projectId: task.project_id,
          status: nextSelected ? 'done' : 'todo',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to update task.';
        Alert.alert('Update failed', message);
      } finally {
        setUpdatingTaskId((current) => (current === task.id ? null : current));
      }
    },
    [updateTaskStatus, user?.id]
  );

  const renderTaskItem = useCallback<ListRenderItem<TaskRow>>(
    ({ item }) => {
      const isCompleted = item.status === 'done';
      const isDisabled = !user?.id || updatingTaskId === item.id;

      return (
        <View className="mb-3 flex flex-row gap-4 rounded-lg bg-white p-4">
          <Checkbox
            isSelected={isCompleted}
            isDisabled={isDisabled}
            onSelectedChange={(next) => handleToggleTask(item, next)}
          />
          <View className={cn('flex-1', isCompleted && 'opacity-50')}>
            <Text
              className={cn('text-lg font-medium', isCompleted && 'text-gray-600 line-through')}>
              {item.title}
            </Text>
            <View className="mt-2 flex flex-row flex-wrap items-center gap-3">
              {item.priority > 0 ? (
                <View className="flex w-fit flex-row items-center justify-center gap-1 p-1">
                  <Text className="text-sm text-red-600">Priority {item.priority}</Text>
                </View>
              ) : null}

              {item.due_at ? (
                <View className="flex w-fit flex-row items-center justify-center gap-1 p-1">
                  <Ionicons name={'calendar-outline'} size={14} />
                  <Text className="text-sm">{formatDueLabel(item.due_at)}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      );
    },
    [handleToggleTask, updatingTaskId, user?.id]
  );

  const listEmpty = (
    <View className="py-10">
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View className="mx-6 rounded-2xl border border-dashed border-border p-6">
          <Text className="text-center text-base text-muted-foreground">
            {user?.id ? 'No tasks yet in this list.' : 'Sign in to view the tasks in this list.'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className={'pb-safe flex-1'}>
      <FlashList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 96, paddingHorizontal: 24 }}
      />

      <View className={'pb-safe absolute bottom-0 left-0 right-0 px-6 pt-2'}>
        <Button variant={'secondary'} onPress={() => router.push('/task/new')}>
          <Ionicons name={'add-circle-outline'} size={24} />
          <Button.Label>Add Todo</Button.Label>
        </Button>
      </View>
    </View>
  );
}
