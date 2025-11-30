import { Text } from '@/components/ui/text';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, TextInput, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { Card } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMMKVString } from 'react-native-mmkv';
import { useAuthStore } from '@/store/auth-store';
import { useTaskFormStore } from '@/store/task-form-store';
import { useDatePickerStore } from '@/store/date-picker-store';
import { useListsQuery } from '@/features/lists/queries/use-lists';
import { useLabelsQuery } from '@/features/labels/queries/use-labels';
import { useCreateTaskMutation } from '@/features/tasks/mutations/use-create-task';
import { useTaskQuery } from '@/features/tasks/queries/use-task';
import { TASK_LIST_STORAGE_KEY } from '@/features/tasks/constants';
import {
  getPriorityLabel,
  getPriorityColor,
  getPriorityBgColor,
} from '@/features/tasks/utils/priority';
import { cn } from '@/lib/utils';
import dayjs from 'dayjs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTaskInputParser } from '@/features/tasks/parsing/use-parse-task-input';
import { PatternSuggestionsCard } from '@/features/tasks/components/pattern-suggestions-card';

// Format due date for display
function formatDueDate(dateString: string | null): string {
  if (!dateString) return 'Due Date';

  const date = dayjs(dateString);
  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  if (date.isSame(today, 'day')) {
    return 'Today';
  } else if (date.isSame(tomorrow, 'day')) {
    return 'Tomorrow';
  } else {
    // Format as "MMM D, YYYY" (e.g., "Nov 16, 2025")
    return date.format('MMM D, YYYY');
  }
}

// ----- Zod schema -----
const TaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
  description: z.string().trim().max(2000, 'Max 2000 characters').optional().or(z.literal('')),
  dueDate: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()]),
});

type TaskForm = z.infer<typeof TaskSchema>;

// List is no longer required - tasks can go to Inbox by default

export default function NewTask() {
  const router = useRouter();

  const inset = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    parent_id?: string | string[];
    list_id?: string | string[];
  }>();
  const parentTaskId = useMemo(() => {
    if (!params.parent_id) {
      return undefined;
    }
    return Array.isArray(params.parent_id) ? params.parent_id[0] : params.parent_id;
  }, [params.parent_id]);
  const listParamId = useMemo(() => {
    if (!params.list_id) {
      return undefined;
    }
    return Array.isArray(params.list_id) ? params.list_id[0] : params.list_id;
  }, [params.list_id]);
  const isSubtask = Boolean(parentTaskId);
  const inputRef = React.useRef<TextInput>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Pattern parsing state
  const [titleInputValue, setTitleInputValue] = useState('');

  // Date picker state (shared with date-picker screen)
  const { selectedDate, clearDate } = useDatePickerStore();
  const [listMMKV, setListMMKV] = useMMKVString(TASK_LIST_STORAGE_KEY);
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { selectedLabels, priority, clearAll } = useTaskFormStore();
  const {
    data: parentTask,
    isLoading: parentLoading,
    error: parentError,
  } = useTaskQuery({ taskId: parentTaskId, createdBy: user?.id });
  const { data: lists = [], isLoading: listsLoading } = useListsQuery(user?.id ?? undefined);
  const { data: allLabels = [] } = useLabelsQuery({ userId: user?.id });

  // Parse title input for patterns
  const parsedPatterns = useTaskInputParser(
    titleInputValue,
    allLabels.map((l) => ({ id: l.id, name: l.name, color: l.color }))
  );

  const parentProject = useMemo(() => {
    if (!parentTask?.project_id) {
      return undefined;
    }

    return lists.find((list) => list.id === parentTask.project_id);
  }, [lists, parentTask?.project_id]);
  const selectedListId = isSubtask ? (parentTask?.project_id ?? null) : (listMMKV ?? null);
  const selectedList = useMemo(() => {
    if (!selectedListId) {
      return null;
    }
    return lists.find((list) => list.id === selectedListId) ?? null;
  }, [lists, selectedListId]);
  const canSelectList = !isSubtask && Boolean(user?.id);
  const activeProjectName = isSubtask
    ? (parentProject?.name ?? (listsLoading ? 'Loading list…' : 'Parent list'))
    : (selectedList?.name ?? (listsLoading ? 'Loading list…' : 'Inbox'));

  // RHF defaults: use selectedDate if present, else null
  const initialDue = useMemo(() => selectedDate ?? null, [selectedDate]); // stable default

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskForm>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: initialDue,
    },
    mode: 'onSubmit',
  });

  useFocusEffect(
    React.useCallback(() => {
      inputRef.current?.focus();
    }, [])
  );

  // Sync from date picker store -> RHF (when returning from date picker)
  useEffect(() => {
    if (selectedDate === null) {
      setValue('dueDate', null, { shouldDirty: false, shouldValidate: true });
    } else {
      setValue('dueDate', selectedDate, { shouldDirty: false, shouldValidate: true });
    }
  }, [selectedDate, setValue]);

  // Set or clear list selection on mount
  useEffect(() => {
    if (isSubtask || !setListMMKV) {
      return;
    }

    if (listParamId) {
      // If list_id param provided, use it
      setListMMKV(listParamId);
    } else {
      // No param provided, clear storage to default to "Inbox"
      setListMMKV(undefined);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Removed error clearing effect - no longer needed since list is optional

  const dueDate = watch('dueDate');
  const { mutateAsync: createTask, isPending } = useCreateTaskMutation();

  const handlePriorityButtonPress = () => {
    Keyboard.dismiss();

    router.push('/pickers/priority-select');
  };

  const submit = handleSubmit(async (data) => {
    Keyboard.dismiss();

    if (!user?.id) {
      setFormError('Sign in to add tasks.');
      return;
    }

    if (isSubtask && parentLoading) {
      setFormError('Parent task is still loading. Please wait.');
      return;
    }

    if (isSubtask && !parentTask) {
      const message = parentError?.message ?? 'Parent task not found.';
      setFormError(message);
      return;
    }

    const targetProjectId = selectedListId;

    // For subtasks, project is required (inherited from parent)
    if (isSubtask && !targetProjectId) {
      setFormError('Unable to determine the parent project.');
      return;
    }

    try {
      await createTask({
        createdBy: user.id,
        projectId: targetProjectId, // Can be null for inbox tasks
        parentId: parentTaskId,
        title: data.title,
        description: data.description ?? '',
        dueDate: data.dueDate,
        labelIds: Array.from(selectedLabels),
        priority,
      });

      reset({
        title: '',
        description: '',
        dueDate: null,
      });
      clearDate();
      clearAll();
      setFormError(null);
      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create task.';
      setFormError(message);
    }
  });

  const parentUnavailable = isSubtask && !parentLoading && !parentTask;
  const isSaving = isSubmitting || isPending || listsLoading || (isSubtask && parentLoading);
  const isPrimaryDisabled = isSaving || parentUnavailable;

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable className={'p-1 px-2'} onPress={() => router.dismiss()}>
              <Ionicons name={'close-outline'} size={24} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable className={'p-1 px-2'} onPress={submit} disabled={isPrimaryDisabled}>
              {isSaving ? (
                <ActivityIndicator size={'small'} />
              ) : (
                <Ionicons name={'checkmark-outline'} size={22} />
              )}
            </Pressable>
          ),
        }}
      />

      <View className={'flex-1'}>
        <ScrollView
          className={'pt-safe'}
          style={{ paddingTop: inset.top }}
          keyboardShouldPersistTaps={'always'}>
          <View className={'p-6 pb-0'}>
            <Controller
              render={({ field: { onChange, onBlur } }) => (
                <TextInput
                  ref={inputRef}
                  onChangeText={(text) => {
                    if (formError) {
                      setFormError(null);
                    }
                    setTitleInputValue(text);
                    onChange(text);
                  }}
                  onBlur={onBlur}
                  value={titleInputValue}
                  placeholder={'New Task'}
                  multiline
                  className={
                    'placeholder:text-muted-foreground/80 w-full min-w-0 px-0 py-2 text-2xl font-semibold'
                  }
                  autoFocus
                />
              )}
              name={'title'}
              control={control}
            />
          </View>

          {isSubtask ? (
            <View className={'px-6 pt-2'}>
              {parentLoading ? (
                <Text className={'text-muted-foreground text-sm'}>Loading parent task…</Text>
              ) : parentTask ? (
                <Text className={'text-muted-foreground text-sm'}>
                  Subtask of “{parentTask.title}”
                </Text>
              ) : (
                <Text className={'text-sm text-red-500'} role={'alert'}>
                  {parentError?.message ?? 'Parent task not found.'}
                </Text>
              )}
            </View>
          ) : null}
          {errors.title ? (
            <Text className={'px-6 text-sm text-red-500'} role={'alert'}>
              {errors.title.message}
            </Text>
          ) : null}

          <View className={'px-6 pb-6 pt-0'}>
            <Controller
              name={'description'}
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder={'Notes'}
                  className={
                    'placeholder:text-muted-foreground/80 w-full min-w-0 px-0 py-2 text-base font-medium'
                  }
                  multiline
                  onChangeText={(text) => {
                    if (formError) {
                      setFormError(null);
                    }
                    onChange(text);
                  }}
                  onBlur={onBlur}
                  value={value ?? ''}
                />
              )}
            />
          </View>

          {selectedLabels.size > 0 && (
            <View className={'flex-1 flex-row px-6'}>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  router.push('/pickers/pick-label');
                }}
                className={'mb-4'}>
                <Card>
                  <Card.Body>
                    <View className={'flex-row items-center gap-2'}>
                      <Ionicons name={'pricetag-outline'} size={18} />
                      <Text>
                        {Array.from(selectedLabels)
                          .map((labelId) => {
                            const label = allLabels.find((l) => l.id === labelId);
                            return label?.name;
                          })
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    </View>
                  </Card.Body>
                </Card>
              </Pressable>
            </View>
          )}

          <ScrollView
            horizontal={true}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            className={'px-6'}>
            {isSubtask ? (
              <View
                className={
                  'border-border mr-4 flex flex-row items-center gap-2 rounded-md border bg-gray-200 px-4 py-2'
                }>
                <Ionicons name={'git-branch-outline'} size={18} />
                <Text className={'max-w-[180px]'} numberOfLines={1}>
                  {parentLoading
                    ? 'Loading parent…'
                    : (parentTask?.title ?? parentError?.message ?? 'Parent not found')}
                </Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => {
                if (!canSelectList) {
                  return;
                }
                Keyboard.dismiss();
                router.push('/pickers/inbox-picker');
              }}
              disabled={!canSelectList}
              className={cn(!canSelectList && 'opacity-60')}>
              <Card className={'border border-gray-200 py-3'}>
                <Card.Body>
                  <View className={'flex-row items-center gap-2'}>
                    <Ionicons name={'file-tray-outline'} size={18} />
                    <Text className={'text-sm font-medium'}>{activeProjectName}</Text>
                  </View>
                </Card.Body>
              </Card>
            </Pressable>

            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                router.push('/pickers/date-picker');
              }}
              className={'ml-3 mr-3'}>
              <Card
                className={'border border-gray-200 py-3'}
                style={{
                  backgroundColor: dueDate ? '#dbeafe' : '#e5e7eb',
                }}>
                <Card.Body>
                  <View className={'flex-row items-center gap-2'}>
                    <Ionicons
                      name={dueDate ? 'calendar' : 'calendar-outline'}
                      size={18}
                      color={dueDate ? '#3b82f6' : undefined}
                    />
                    <Text
                      className={'text-sm font-medium'}
                      style={{
                        color: dueDate ? '#3b82f6' : undefined,
                      }}>
                      {formatDueDate(dueDate)}
                    </Text>
                  </View>
                </Card.Body>
              </Card>
            </Pressable>

            <Pressable onPress={() => handlePriorityButtonPress()} className={'mr-3'}>
              <Card
                className={'border border-gray-200 py-3'}
                style={{
                  backgroundColor: priority > 0 ? getPriorityBgColor(priority) : '#e5e7eb',
                }}>
                <Card.Body>
                  <View className={'flex-row items-center gap-2'}>
                    <Ionicons
                      name={priority > 0 ? 'flag' : 'flag-outline'}
                      size={18}
                      color={priority > 0 ? getPriorityColor(priority) : undefined}
                    />
                    <Text
                      className={'text-sm font-medium'}
                      style={{
                        color: priority > 0 ? getPriorityColor(priority) : undefined,
                      }}>
                      {getPriorityLabel(priority)}
                    </Text>
                  </View>
                </Card.Body>
              </Card>
            </Pressable>

            {selectedLabels.size === 0 && (
              <Pressable onPress={() => router.push('/pickers/pick-label')} className={'mr-3'}>
                <Card className={'border border-gray-200 py-3'}>
                  <Card.Body>
                    <View className={'flex-row items-center gap-2'}>
                      <Ionicons name={'pricetag-outline'} size={18} />
                      <Text className={'text-sm font-medium'}>Labels</Text>
                    </View>
                  </Card.Body>
                </Card>
              </Pressable>
            )}
          </ScrollView>
          {formError ? (
            <Text className={'px-6 pt-4 text-sm text-red-500'} role={'alert'}>
              {formError}
            </Text>
          ) : null}
        </ScrollView>
        <KeyboardStickyView>
          <PatternSuggestionsCard
            patterns={parsedPatterns}
            titleInputValue={titleInputValue}
            setTitleInputValue={setTitleInputValue}
            setValue={setValue}
            inputRef={inputRef}
          />
        </KeyboardStickyView>
      </View>
    </>
  );
}
