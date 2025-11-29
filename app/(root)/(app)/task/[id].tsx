import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Text } from '@/components/ui/text';
import { Button, Card, Checkbox, Dialog } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTaskQuery } from '@/features/tasks/queries/use-task';
import { useTaskLabelsQuery } from '@/features/tasks/queries/use-task-labels';
import { useUpdateTaskStatusMutation } from '@/features/tasks/mutations/use-update-task-status';
import { useUpdateTaskLabelsMutation } from '@/features/tasks/mutations/use-update-task-labels';
import { useDeleteTaskMutation } from '@/features/tasks/mutations/use-delete-task';
import { useReorderTasksMutation } from '@/features/tasks/mutations/use-reorder-tasks';
import { useAuthStore } from '@/store/auth-store';
import { useTaskFormStore } from '@/store/task-form-store';
import { useListsQuery } from '@/features/lists/queries/use-lists';
import { useUpdateTaskMutation } from '@/features/tasks/mutations/use-update-task';
import { useSubtasksQuery, type SubtaskWithCounts } from '@/features/tasks/queries/use-subtasks';
import { TaskCard, formatDueLabel } from '@/features/tasks/components/task-card';
import { getPriorityLabel, getPriorityColor } from '@/features/tasks/utils/priority';
import dayjs from 'dayjs';
import { useDatePickerStore } from '@/store/date-picker-store';

const TaskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
  description: z.string().trim().max(2000, 'Max 2000 characters').optional().or(z.literal('')),
});

type TaskForm = z.infer<typeof TaskFormSchema>;

export default function TaskDetails() {
  const router = useRouter();

  const params = useLocalSearchParams<{ id?: string }>();
  const taskId = params.id;

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const {
    selectedLabels,
    setSelectedLabels,
    priority: storePriority,
    setPriority: setStorePriority,
    setEditingTaskId,
  } = useTaskFormStore();

  const { data: task, isLoading } = useTaskQuery({ taskId, createdBy: user?.id });
  const { data: taskLabels = [], isLoading: labelsLoading } = useTaskLabelsQuery({ taskId });
  const { data: subtasks = [], isLoading: subtasksLoading } = useSubtasksQuery({
    parentId: taskId,
    createdBy: user?.id,
  });
  const { data: lists = [], isLoading: listsLoading } = useListsQuery(user?.id ?? undefined);

  const { selectedDate, setSelectedDate } = useDatePickerStore();
  const currentList = lists.find((list) => list.id === task?.project_id);
  const completedSubtasks = subtasks.filter((item) => item.status === 'done').length;
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
  const { mutateAsync: deleteTask, isPending: isDeletingTask } = useDeleteTaskMutation();
  const { mutateAsync: reorderTasks } = useReorderTasksMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const isInitializedRef = useRef(false);

  // Initialize store with task data (only once)
  useEffect(() => {
    if (!task || !taskId || isInitializedRef.current) return;

    setEditingTaskId(taskId);
    setStorePriority(task.priority);
    setSelectedDate(task.due_at ? dayjs(task.due_at).format('YYYY-MM-DD') : null);

    if (!labelsLoading) {
      setSelectedLabels(new Set(taskLabels.map((label) => label.id)));
    }

    isInitializedRef.current = true;
  }, [
    task,
    taskId,
    taskLabels,
    labelsLoading,
    setEditingTaskId,
    setStorePriority,
    setSelectedDate,
    setSelectedLabels,
  ]);

  // Watch for priority changes from the store
  const prevPriorityRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!task || !user?.id || !isInitializedRef.current) return;

    if (prevPriorityRef.current === undefined) {
      prevPriorityRef.current = task.priority;
      return;
    }

    if (storePriority !== task.priority && storePriority !== prevPriorityRef.current) {
      prevPriorityRef.current = storePriority;
      void updateTask({
        taskId: task.id,
        projectId: task.project_id,
        payload: { priority: storePriority },
      });
    }
  }, [storePriority, task, user?.id, updateTask]);

  // Watch for label changes from the store
  const prevLabelIdsRef = useRef<string>('');
  useEffect(() => {
    if (!task || !user?.id || !isInitializedRef.current || labelsLoading) return;

    const currentTaskLabelIds = taskLabels
      .map((l) => l.id)
      .sort()
      .join(',');
    const selectedLabelIdsStr = Array.from(selectedLabels).sort().join(',');

    if (prevLabelIdsRef.current === '') {
      prevLabelIdsRef.current = currentTaskLabelIds;
      return;
    }

    if (
      selectedLabelIdsStr !== currentTaskLabelIds &&
      selectedLabelIdsStr !== prevLabelIdsRef.current
    ) {
      prevLabelIdsRef.current = selectedLabelIdsStr;
      void updateTaskLabels({
        taskId: task.id,
        projectId: task.project_id,
        labelIds: Array.from(selectedLabels),
      });
    }
  }, [selectedLabels, task, taskLabels, user?.id, labelsLoading, updateTaskLabels]);

  // Watch for date changes from the store
  const prevDateRef = useRef<string>('');
  useEffect(() => {
    if (!task || !user?.id || !isInitializedRef.current) return;

    const currentTaskDate = task.due_at ? dayjs(task.due_at).format('YYYY-MM-DD') : '';
    const currentDate = selectedDate ?? '';

    if (prevDateRef.current === '') {
      prevDateRef.current = currentTaskDate;
      return;
    }

    if (currentDate !== currentTaskDate && currentDate !== prevDateRef.current) {
      prevDateRef.current = currentDate;
      void updateTask({
        taskId: task.id,
        projectId: task.project_id,
        payload: {
          due_at: currentDate ? `${currentDate}T12:00:00.000Z` : null,
        },
      });
    }
  }, [selectedDate, task, user?.id, updateTask]);

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
  const hasUser = Boolean(user?.id);
  const actionDisabled = !task || !hasUser || updatingStatus;
  const saveDisabled = !task || !hasUser || !isDirty;
  const canAddSubtask = Boolean(task?.id && hasUser);

  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!task || !user?.id) return;

    try {
      await deleteTask({
        taskId: task.id,
        projectId: task.project_id,
        parentId: task.parent_id,
      });

      setIsOpen(false);
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete task.';
      Alert.alert('Delete failed', message);
    }
  }, [task, user?.id, deleteTask, router]);

  const handleSubtaskDragEnd = useCallback(
    async ({ data }: { data: SubtaskWithCounts[] }) => {
      if (!task) return;

      try {
        // Assign new sort_order values based on position
        const updates = data.map((subtask, index) => ({
          id: subtask.id,
          sortOrder: (index + 1) * 1000, // Use increments of 1000
        }));

        await reorderTasks({
          projectId: task.project_id,
          tasks: updates,
        });
      } catch (err) {
        console.error('Failed to reorder subtasks:', err);
      }
    },
    [task, reorderTasks]
  );

  const renderSubtaskItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<SubtaskWithCounts>) => {
      return (
        <ScaleDecorator>
          <TaskCard
            task={item}
            onPress={(nextTask) => router.push(`/task/${nextTask.id}`)}
            onLongPress={drag}
            isActive={isActive}
          />
        </ScaleDecorator>
      );
    },
    [router]
  );

  if (isLoading) {
    return (
      <View className={'flex-1 items-center justify-center p-6'}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!hasUser) {
    return (
      <View className={'flex-1 items-center justify-center p-6'}>
        <Text className={'text-muted-foreground text-center text-base'}>
          Sign in to view this task.
        </Text>
      </View>
    );
  }

  if (!task) {
    return (
      <View className={'flex-1 items-center justify-center p-6'}>
        <Text className={'text-muted-foreground text-center text-base'}>
          Task not found or you no longer have access.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className={'pb-safe flex-1'} style={{ paddingTop: 60 }}>
      <Stack.Screen
        options={{
          headerRight: () =>
            !saveDisabled ? (
              <View className={'flex flex-row items-center justify-between pr-4 pt-6'}>
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
            ) : null,
        }}
      />

      <Card className={'mx-6 mt-6 rounded-2xl'}>
        <Card.Body>
          <View className={'mb-4 flex flex-row items-start gap-4'}>
            <Checkbox
              isSelected={isCompleted}
              isDisabled={actionDisabled}
              onSelectedChange={(next) => void handleToggleStatus(next)}
            />

            <View className={'flex-1 items-center'}>
              <Controller
                control={control}
                name={'title'}
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    value={value}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      if (formError) setFormError(null);
                      onChange(text);
                    }}
                    editable={hasUser}
                    placeholder={'Task title'}
                    className={
                      'placeholder:text-muted-foreground/80 w-full min-w-0 p-0 text-2xl font-semibold'
                    }
                    multiline
                    style={{ lineHeight: 24 }}
                  />
                )}
              />
              {errors.title && (
                <Text className={'mt-1 text-sm text-red-500'} role={'alert'}>
                  {errors.title.message}
                </Text>
              )}
              {formError && (
                <Text className={'mt-1 text-sm text-red-500'} role={'alert'}>
                  {formError}
                </Text>
              )}
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
                    if (formError) setFormError(null);
                    onChange(text);
                  }}
                  onBlur={onBlur}
                  editable={hasUser}
                  placeholder={'Add description...'}
                  multiline
                  className={
                    'text-muted-foreground placeholder:text-muted-foreground/60 w-full min-w-0 px-0 py-2 text-base'
                  }
                />
              )}
            />
            {errors.description && (
              <Text className={'mt-1 text-sm text-red-500'} role={'alert'}>
                {errors.description.message}
              </Text>
            )}
          </View>

          <Pressable
            onPress={() =>
              router.push({
                pathname: '/pickers/project-picker',
                params: { currentProjectId: task.project_id, taskId: task.id },
              })
            }
            className={'flex flex-row items-center gap-2 border-b border-b-gray-200 py-3'}>
            <Ionicons name={'file-tray-outline'} size={18} />
            <Text>
              {listsLoading ? 'Loading list…' : (currentList?.name ?? 'No list selected')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/pickers/date-picker')}
            className={'flex flex-row items-center gap-2 border-b border-b-gray-200 py-3'}>
            <Ionicons name={'calendar-outline'} size={18} />
            <Text>{formatDueLabel(task.due_at)}</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/pickers/priority-select')}
            className={'flex flex-row items-center gap-2 border-b border-b-gray-200 py-3'}>
            <Ionicons
              name={task.priority > 0 ? 'flag' : 'flag-outline'}
              size={18}
              color={task.priority > 0 ? getPriorityColor(task.priority) : undefined}
            />
            <Text
              style={task.priority > 0 ? { color: getPriorityColor(task.priority) } : undefined}>
              {getPriorityLabel(task.priority)}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/pickers/pick-label')}
            className={'flex flex-row items-center gap-2 border-b-gray-200 py-3'}>
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
        </Card.Body>
      </Card>

      <View className={'mb-4 mt-6 flex flex-row items-center gap-2 px-8'}>
        <Text className={'font-semibold'}>Sub Tasks</Text>
        <Text>{`${completedSubtasks}/${totalSubtasks}`}</Text>
      </View>

      <Card className={'mx-6 rounded-2xl'}>
        <Card.Body>
          {subtasksLoading ? (
            <View className={'py-4'}>
              <ActivityIndicator />
            </View>
          ) : (
            totalSubtasks > 0 && (
              <View className={'mb-4'}>
                <DraggableFlatList
                  data={subtasks}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSubtaskItem}
                  onDragEnd={handleSubtaskDragEnd}
                  scrollEnabled={false}
                />
              </View>
            )
          )}
          <Button
            variant={'tertiary'}
            isDisabled={!canAddSubtask}
            onPress={() =>
              router.push({
                pathname: '/task/new',
                params: { parent_id: task.id },
              })
            }>
            <Ionicons name="add" size={20} />
            <Button.Label>Add Subtask</Button.Label>
          </Button>
        </Card.Body>
      </Card>

      <View className={'px-4 pb-6 pt-6'}>
        <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
          <Dialog.Trigger asChild>
            <Button variant={'destructive-soft'}>
              <Button.Label>Delete</Button.Label>
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <Dialog.Close className="-mb-2 self-end" />
              <View className="mb-5 gap-1.5">
                <Dialog.Title>Delete Task</Dialog.Title>
                <Dialog.Description>
                  Are you sure you want to delete this task? This action cannot be undone.
                </Dialog.Description>
              </View>
              <View className="flex-row justify-end gap-3">
                <Dialog.Close asChild>
                  <Button variant="ghost" size="sm">
                    <Button.Label>Cancel</Button.Label>
                  </Button>
                </Dialog.Close>
                <Button size="sm" onPress={() => void handleDelete()} isDisabled={isDeletingTask}>
                  <Button.Label>{isDeletingTask ? 'Deleting...' : 'Delete'}</Button.Label>
                </Button>
              </View>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog>
      </View>
    </ScrollView>
  );
}
