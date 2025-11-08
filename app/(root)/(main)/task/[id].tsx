import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Text } from '@/components/ui/text';
import BackButton from '@/components/ui/back-button';
import { Button, Card, Checkbox } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTaskQuery } from '@/features/tasks/queries/use-task';
import { useTaskLabelsQuery } from '@/features/tasks/queries/use-task-labels';
import { useUpdateTaskStatusMutation } from '@/features/tasks/mutations/use-update-task-status';
import { useUpdateTaskLabelsMutation } from '@/features/tasks/mutations/use-update-task-labels';
import { useAuthStore } from '@/store/auth-store';
import { useTaskFormStore } from '@/store/task-form-store';
import { useListsQuery } from '@/features/lists/queries/use-lists';
import { useUpdateTaskMutation } from '@/features/tasks/mutations/use-update-task';
import { useSubtasksQuery } from '@/features/tasks/queries/use-subtasks';
import { TaskCard, formatDueLabel } from '@/features/tasks/components/task-card';
import { getPriorityLabel, getPriorityColor } from '@/features/tasks/utils/priority';
import { useMMKVString } from 'react-native-mmkv';

const TaskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
  description: z.string().trim().max(2000, 'Max 2000 characters').optional().or(z.literal('')),
});

type TaskForm = z.infer<typeof TaskFormSchema>;

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
    selectedLabels,
    setSelectedLabels,
    priority: storePriority,
    setPriority: setStorePriority,
    setEditingTaskId,
  } = useTaskFormStore();

  const {
    data: task,
    isLoading,
    isRefetching,
    refetch,
  } = useTaskQuery({ taskId, createdBy: user?.id });
  const { data: taskLabels = [], isLoading: labelsLoading } = useTaskLabelsQuery({ taskId });
  const {
    data: subtasks = [],
    isLoading: subtasksLoading,
    isRefetching: subtasksRefetching,
    refetch: refetchSubtasks,
  } = useSubtasksQuery({ parentId: taskId, createdBy: user?.id });
  const { data: lists = [], isLoading: listsLoading } = useListsQuery(user?.id ?? undefined);

  const [dateMMKV, setDateMMKV] = useMMKVString('date');
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
  } = useForm<TaskForm>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
    },
  });

  useEffect(() => {
    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
    });
  }, [reset, task?.title, task?.description]);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { mutateAsync: updateTaskStatus } = useUpdateTaskStatusMutation();
  const { mutateAsync: updateTask, isPending: isUpdatingTask } = useUpdateTaskMutation();
  const { mutateAsync: updateTaskLabels } = useUpdateTaskLabelsMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize store with task data when editing (only once)
  useEffect(() => {
    if (!task || !taskId || isInitialized) return;

    setEditingTaskId(taskId);
    setStorePriority(task.priority);

    // Set date in MMKV
    if (task.due_at) {
      const date = new Date(task.due_at);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      setDateMMKV?.(`${y}-${m}-${d}`);
    } else {
      setDateMMKV?.(undefined);
    }

    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id, taskId]);

  // Initialize labels (only once)
  useEffect(() => {
    if (labelsLoading || !isInitialized) return;

    const labelIds = taskLabels.map((label) => label.id);
    setSelectedLabels(new Set(labelIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized, labelsLoading]);

  // Watch for priority changes from the store (when user changes it in picker)
  const prevPriority = React.useRef<number | null>(null);
  useEffect(() => {
    if (!task || !user?.id || !isInitialized) return;

    // Initialize on first run after initialization
    if (prevPriority.current === null) {
      prevPriority.current = task.priority;
      return;
    }

    // Only update if priority changed AND it's different from task priority
    if (storePriority !== task.priority && storePriority !== prevPriority.current) {
      prevPriority.current = storePriority;
      void updateTask({
        taskId: task.id,
        projectId: task.project_id,
        payload: { priority: storePriority },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storePriority]);

  // Watch for label changes from the store (when user changes it in picker)
  const prevLabelIdsStr = React.useRef<string>('');
  useEffect(() => {
    if (!task || !user?.id || !isInitialized || labelsLoading) return;

    const currentTaskLabelIds = taskLabels
      .map((l) => l.id)
      .sort()
      .join(',');
    const selectedLabelIdsStr = Array.from(selectedLabels).sort().join(',');

    // Initialize on first run after initialization
    if (prevLabelIdsStr.current === '') {
      prevLabelIdsStr.current = currentTaskLabelIds;
      return;
    }

    // Only update if labels changed AND it's different from current task labels
    if (
      selectedLabelIdsStr !== currentTaskLabelIds &&
      selectedLabelIdsStr !== prevLabelIdsStr.current
    ) {
      prevLabelIdsStr.current = selectedLabelIdsStr;
      void updateTaskLabels({
        taskId: task.id,
        projectId: task.project_id,
        labelIds: Array.from(selectedLabels),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLabels.size]);

  // Watch for date changes from MMKV (when user changes it in picker)
  const prevDate = React.useRef<string>('');
  useEffect(() => {
    if (!task || !user?.id || !isInitialized) return;

    const currentTaskDate = task.due_at
      ? (() => {
          const date = new Date(task.due_at);
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        })()
      : '';

    // Initialize on first run after initialization
    if (prevDate.current === '') {
      prevDate.current = currentTaskDate;
      return;
    }

    const currentDate = dateMMKV ?? '';

    // Only update if date changed AND it's different from current task date
    if (currentDate !== currentTaskDate && currentDate !== prevDate.current) {
      prevDate.current = currentDate;
      void updateTask({
        taskId: task.id,
        projectId: task.project_id,
        payload: {
          due_at: currentDate ? `${currentDate}T00:00:00.000Z` : null,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMMKV]);

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

  const onSubmit = handleSubmit(async ({ title, description }) => {
    if (!task || !user?.id) {
      return;
    }

    try {
      await updateTask({
        taskId: task.id,
        projectId: task.project_id,
        payload: {
          title,
          description: description?.trim() || null,
        },
      });
      reset({ title, description });
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

  if (!task)
    return (
      <View className={'p-6'}>
        <Text className={'text-center font-semibold'}>Task Not Found</Text>
      </View>
    );

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
                </View>
              </View>

              <View className={'mb-4'}>
                <Controller
                  control={control}
                  name={'description'}
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      value={value ?? ''}
                      onChangeText={(text) => {
                        if (formError) {
                          setFormError(null);
                        }
                        onChange(text);
                      }}
                      onBlur={onBlur}
                      editable={Boolean(task && user?.id)}
                      placeholder={'Add description...'}
                      multiline
                      className={
                        'w-full min-w-0 px-0 py-2 text-base text-muted-foreground placeholder:text-muted-foreground/60'
                      }
                    />
                  )}
                />
                {errors.description ? (
                  <Text className={'mt-1 text-sm text-red-500'} role={'alert'}>
                    {errors.description.message}
                  </Text>
                ) : null}
              </View>

              <View className={'flex flex-row items-center gap-2 border-b border-b-gray-200 py-3'}>
                <Ionicons name={'pricetag-outline'} size={18} />
                <Text>
                  {listsLoading ? 'Loading list…' : (currentList?.name ?? 'No list selected')}
                </Text>
              </View>

              <Pressable
                onPress={() => router.push('/task/date-picker')}
                className={'flex flex-row items-center gap-2 border-b border-b-gray-200 py-3'}>
                <Ionicons name={'calendar-outline'} size={18} />
                <Text>{formatDueLabel(task?.due_at)}</Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/task/priority-select')}
                className={'flex flex-row items-center gap-2 border-b border-b-gray-200 py-3'}>
                <Ionicons
                  name={task?.priority && task.priority > 0 ? 'flag' : 'flag-outline'}
                  size={18}
                  color={
                    task?.priority && task.priority > 0
                      ? getPriorityColor(task.priority)
                      : undefined
                  }
                />
                <Text
                  style={
                    task?.priority && task.priority > 0
                      ? { color: getPriorityColor(task.priority) }
                      : undefined
                  }>
                  {task?.priority !== undefined ? getPriorityLabel(task.priority) : 'No priority'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => router.push('/labels/pick-label')}
                className={'flex flex-row items-center gap-2 border-b border-b-gray-200 py-3'}>
                <Ionicons name={'pricetags-outline'} size={18} />
                <View className={'flex-1 flex-row flex-wrap gap-2'}>
                  {labelsLoading ? (
                    <Text>Loading labels...</Text>
                  ) : taskLabels.length > 0 ? (
                    taskLabels.map((label) => (
                      <View
                        key={label.id}
                        className={'flex-row items-center gap-1 rounded-full px-3 py-1'}
                        style={{ backgroundColor: label.color || '#6366f1' }}>
                        <Text className={'text-sm text-white'}>{label.name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className={'text-muted-foreground'}>Add labels</Text>
                  )}
                </View>
              </Pressable>
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
                  onPress={(nextTask) => router.push(`/task/${nextTask.id}`)}
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
