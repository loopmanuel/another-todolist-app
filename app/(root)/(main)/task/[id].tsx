import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, TextInput, View } from 'react-native';
import { Text } from '@/components/ui/text';
import BackButton from '@/components/ui/back-button';
import { Button, Card, Checkbox } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import type { Tables } from '@/supabase/database.types';
import { useTaskQuery } from '@/features/tasks/queries/use-task';
import { useUpdateTaskStatusMutation } from '@/features/tasks/mutations/use-update-task-status';
import { useAuthStore } from '@/store/auth-store';
import { useListsQuery } from '@/features/lists/queries/use-lists';
import { useUpdateTaskMutation } from '@/features/tasks/mutations/use-update-task';
import { useSubtasksQuery } from '@/features/tasks/queries/use-subtasks';
import { TaskCard, formatDueLabel, formatPriority } from '@/features/tasks/components/task-card';

const TaskTitleSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
});

type TaskTitleForm = z.infer<typeof TaskTitleSchema>;

export default function TaskDetails() {
  const router = useRouter();

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
  const {
    data: subtasks = [],
    isLoading: subtasksLoading,
    isRefetching: subtasksRefetching,
    refetch: refetchSubtasks,
  } = useSubtasksQuery({ parentId: taskId, createdBy: user?.id });
  const { data: lists = [], isLoading: listsLoading } = useListsQuery(user?.id ?? undefined);
  const currentList = useMemo(
    () => lists.find((list) => list.id === task?.project_id),
    [lists, task?.project_id]
  );
  const completedSubtasks = useMemo(
    () => subtasks.filter((item) => item.status === 'done').length,
    [subtasks]
  );
  const totalSubtasks = subtasks.length;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<TaskTitleForm>({
    resolver: zodResolver(TaskTitleSchema),
    defaultValues: {
      title: task?.title ?? '',
    },
  });

  useEffect(() => {
    reset({ title: task?.title ?? '' });
  }, [reset, task?.title]);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingSubtaskId, setUpdatingSubtaskId] = useState<string | null>(null);
  const { mutateAsync: updateTaskStatus } = useUpdateTaskStatusMutation();
  const { mutateAsync: updateTask, isPending: isUpdatingTask } = useUpdateTaskMutation();
  const [formError, setFormError] = useState<string | null>(null);

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
          parentId: task.parent_id ?? null,
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

  const handleToggleSubtask = useCallback(
    async (subtask: Tables<'tasks'>, nextSelected: boolean) => {
      if (!user?.id) {
        return;
      }
      setUpdatingSubtaskId(subtask.id);
      try {
        await updateTaskStatus({
          taskId: subtask.id,
          projectId: subtask.project_id,
          parentId: subtask.parent_id ?? null,
          status: nextSelected ? 'done' : 'todo',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to update subtask.';
        Alert.alert('Update failed', message);
      } finally {
        setUpdatingSubtaskId((current) => (current === subtask.id ? null : current));
      }
    },
    [updateTaskStatus, user?.id]
  );

  const onSubmit = handleSubmit(async ({ title }) => {
    if (!task || !user?.id) {
      return;
    }

    try {
      await updateTask({
        taskId: task.id,
        projectId: task.project_id,
        payload: { title },
      });
      reset({ title });
      setFormError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update task.';
      setFormError(message);
    }
  });

  const isCompleted = task?.status === 'done';
  const actionDisabled = !task || !user?.id || updatingStatus;
  const showSignIn = !user?.id;
  const showEmptyState = !isLoading && !task && !showSignIn;
  const saveDisabled = !task || !user?.id || !isDirty;
  const isRefreshing = isRefetching || subtasksRefetching;
  const handleRefresh = useCallback(() => {
    void Promise.all([refetch(), refetchSubtasks()]);
  }, [refetch, refetchSubtasks]);
  const canAddSubtask = Boolean(task?.id && user?.id);

  return (
    <ScrollView
      className={'pb-safe flex-1'}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={'#000'} />
      }>
      <View className={'flex flex-row items-center justify-between px-6 pr-4 pt-6'}>
        <BackButton isClose />
        <Button
          className={'rounded-full'}
          isIconOnly
          onPress={() => void onSubmit()}
          isDisabled={saveDisabled || isSubmitting || isUpdatingTask}>
          <Button.Label>
            {isSubmitting || isUpdatingTask ? (
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
                  <Controller
                    control={control}
                    name={'title'}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        value={value}
                        onBlur={onBlur}
                        onChangeText={(text) => {
                          if (formError) {
                            setFormError(null);
                          }
                          onChange(text);
                        }}
                        editable={Boolean(task && user?.id)}
                        placeholder={'Task title'}
                        className={
                          'w-full min-w-0 px-0 py-0 text-2xl font-semibold placeholder:text-muted-foreground/80'
                        }
                      />
                    )}
                  />
                  {errors.title ? (
                    <Text className={'mt-1 text-sm text-red-500'} role={'alert'}>
                      {errors.title.message}
                    </Text>
                  ) : null}
                  {formError ? (
                    <Text className={'mt-1 text-sm text-red-500'} role={'alert'}>
                      {formError}
                    </Text>
                  ) : null}
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
                  {listsLoading ? 'Loading list…' : (currentList?.name ?? 'No list selected')}
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
        <Text>{showSignIn ? '--' : `${completedSubtasks}/${totalSubtasks}`}</Text>
      </View>

      <Card className={'mx-6 rounded-2xl'}>
        <Card.Body>
          {showSignIn ? (
            <Text className={'mb-4 text-sm text-muted-foreground'}>
              Sign in to manage subtasks.
            </Text>
          ) : subtasksLoading ? (
            <View className={'py-4'}>
              <ActivityIndicator />
            </View>
          ) : totalSubtasks === 0 ? (
            <Text className={'mb-4 text-sm text-muted-foreground'}>No subtasks yet.</Text>
          ) : (
            <View className={'mb-4'}>
              {subtasks.map((subtask) => (
                <TaskCard
                  key={subtask.id}
                  task={subtask}
                  isDisabled={!user?.id || updatingSubtaskId === subtask.id}
                  onPress={(nextTask) => router.push(`/task/${nextTask.id}`)}
                  onToggleStatus={handleToggleSubtask}
                />
              ))}
            </View>
          )}
          <Button
            variant={'tertiary'}
            isDisabled={!canAddSubtask}
            onPress={() =>
              task?.id
                ? router.push({
                    pathname: '/task/new',
                    params: { parent_id: task.id },
                  })
                : undefined
            }>
            <Ionicons name="add" size={20} />
            <Button.Label>Add Subtask</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
