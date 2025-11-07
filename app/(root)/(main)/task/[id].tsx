import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import BackButton from '@/components/ui/back-button';
import { Button, Card, Checkbox } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

import { useTaskQuery } from '@/features/tasks/queries/use-task';
import { useUpdateTaskStatusMutation } from '@/features/tasks/mutations/use-update-task-status';
import { useAuthStore } from '@/store/auth-store';
import { useListsQuery } from '@/features/lists/queries/use-lists';

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

function formatPriority(priority?: number | null) {
  if (!priority || priority <= 0) {
    return 'No priority';
  }

  return `Priority ${priority}`;
}

export default function TaskDetails() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const taskId = useMemo(() => {
    if (!params.id) {
      return undefined;
    }
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params.id]);

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const {
    data: task,
    isLoading,
    isRefetching,
    refetch,
  } = useTaskQuery({ taskId, createdBy: user?.id });
  const { data: lists = [], isLoading: listsLoading } = useListsQuery(user?.id ?? undefined);
  const currentList = useMemo(
    () => lists.find((list) => list.id === task?.project_id),
    [lists, task?.project_id]
  );

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { mutateAsync: updateTaskStatus } = useUpdateTaskStatusMutation();

  const handleToggleStatus = useCallback(
    async (nextSelected: boolean) => {
      if (!task || !user?.id) {
        return;
      }

      setUpdatingStatus(true);
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
        setUpdatingStatus(false);
      }
    },
    [task, updateTaskStatus, user?.id]
  );

  const isCompleted = task?.status === 'done';
  const actionDisabled = !task || !user?.id || updatingStatus;
  const showSignIn = !user?.id;
  const showEmptyState = !isLoading && !task && !showSignIn;

  return (
    <ScrollView
      className={'pb-safe flex-1'}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} tintColor={'#000'} />
      }>
      <View className={'flex flex-row items-center justify-between px-6 pr-4 pt-6'}>
        <BackButton isClose />
        <Button
          className={'rounded-full'}
          isIconOnly
          onPress={() => void handleToggleStatus(!isCompleted)}
          isDisabled={actionDisabled}>
          <Button.Label>
            {updatingStatus ? (
              <ActivityIndicator size={'small'} />
            ) : (
              <Ionicons name={'checkmark-outline'} size={22} />
            )}
          </Button.Label>
        </Button>
      </View>

      <Card className={'mx-6 mt-6 rounded-2xl'}>
        <Card.Body>
          {isLoading ? (
            <View className={'py-8'}>
              <ActivityIndicator />
            </View>
          ) : showSignIn ? (
            <Text className={'text-center text-base text-muted-foreground'}>
              Sign in to view this task.
            </Text>
          ) : showEmptyState ? (
            <Text className={'text-center text-base text-muted-foreground'}>
              Task not found or you no longer have access.
            </Text>
          ) : (
            <>
              <View className={'mb-4 flex flex-row items-start gap-4'}>
                <Checkbox
                  isSelected={isCompleted}
                  isDisabled={actionDisabled}
                  onSelectedChange={(next) => {
                    void handleToggleStatus(next);
                  }}
                />

                <View className={'flex-1'}>
                  <Text className={'text-2xl font-semibold'}>{task?.title ?? 'Untitled task'}</Text>
                  {task?.description ? (
                    <Text className={'mt-2 text-base text-muted-foreground'}>
                      {task.description}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View className={'flex flex-row items-center gap-2 border-b border-b-gray-200 py-3'}>
                <Ionicons name={'pricetag-outline'} size={18} />
                <Text>
                  {listsLoading ? 'Loading list…' : currentList?.name ?? 'No list selected'}
                </Text>
              </View>

              <View className={'flex flex-row items-center gap-2 border-b border-b-gray-200 py-3'}>
                <Ionicons name={'calendar-outline'} size={18} />
                <Text>{formatDueLabel(task?.due_at)}</Text>
              </View>

              <View className={'flex flex-row items-center gap-2 border-b-gray-200 py-3'}>
                <Ionicons name={'flag-outline'} size={18} />
                <Text>{formatPriority(task?.priority)}</Text>
              </View>
            </>
          )}
        </Card.Body>
      </Card>

      <View className={'mb-4 mt-6 flex flex-row items-center gap-2 px-8'}>
        <Text className={'font-semibold'}>Sub Tasks</Text>
        <Text>0/0</Text>
      </View>

      <Card className={'mx-6 rounded-2xl'}>
        <Card.Body>
          <Button variant={'tertiary'}>
            <Ionicons name="add" size={20} />
            <Button.Label>Add Subtask</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
