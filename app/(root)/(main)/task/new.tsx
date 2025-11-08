import { Text } from '@/components/ui/text';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import BackButton from '@/components/ui/back-button';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMMKVString } from 'react-native-mmkv';
import { useAuthStore } from '@/store/auth-store';
import { useListsQuery } from '@/features/lists/queries/use-lists';
import { useCreateTaskMutation } from '@/features/tasks/mutations/use-create-task';
import { useTaskQuery } from '@/features/tasks/queries/use-task';

// Local YYYY-MM-DD (avoids UTC off-by-one)
function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ----- Zod schema -----
const TaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Max 200 characters'),
  description: z.string().trim().max(2000, 'Max 2000 characters').optional().or(z.literal('')),
  dueDate: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()]),
});

type TaskForm = z.infer<typeof TaskSchema>;

export default function NewTask() {
  const router = useRouter();
  const params = useLocalSearchParams<{ parent_id?: string | string[] }>();
  const parentTaskId = useMemo(() => {
    if (!params.parent_id) {
      return undefined;
    }
    return Array.isArray(params.parent_id) ? params.parent_id[0] : params.parent_id;
  }, [params.parent_id]);
  const isSubtask = Boolean(parentTaskId);
  const inputRef = React.useRef<TextInput>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Persisted date (shared with your date-picker screen)
  const [dateMMKV, setDateMMKV] = useMMKVString('date');
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const {
    data: parentTask,
    isLoading: parentLoading,
    error: parentError,
  } = useTaskQuery({ taskId: parentTaskId, createdBy: user?.id });
  const { data: lists = [], isLoading: listsLoading } = useListsQuery(user?.id ?? undefined);
  const defaultProject = lists[0];
  const parentProject = useMemo(() => {
    if (!parentTask?.project_id) {
      return undefined;
    }

    return lists.find((list) => list.id === parentTask.project_id);
  }, [lists, parentTask?.project_id]);
  const targetProjectId = parentTask?.project_id ?? defaultProject?.id;
  const activeProjectName = isSubtask
    ? parentProject?.name ?? (listsLoading ? 'Loading list…' : 'Parent list')
    : defaultProject?.name ?? 'Inbox';

  // RHF defaults: use MMKV if present, else null
  const initialDue = useMemo(() => dateMMKV ?? null, [dateMMKV]); // stable default

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

  // Sync from MMKV -> RHF (when returning from date picker)
  useEffect(() => {
    if (dateMMKV === undefined) {
      setValue('dueDate', null, { shouldDirty: false, shouldValidate: true });
    } else {
      setValue('dueDate', dateMMKV, { shouldDirty: false, shouldValidate: true });
    }
  }, [dateMMKV, setValue]);

  const dueDate = watch('dueDate');
  const { mutateAsync: createTask, isPending } = useCreateTaskMutation();

  const handlePriorityButtonPress = () => {
    Keyboard.dismiss();

    router.push('/task/priority-select');
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

    if (!targetProjectId) {
      setFormError(isSubtask ? 'Unable to determine the parent project.' : 'Create a list before adding tasks.');
      return;
    }

    try {
      await createTask({
        createdBy: user.id,
        projectId: targetProjectId,
        parentId: parentTaskId,
        title: data.title,
        description: data.description ?? '',
        dueDate: data.dueDate,
      });

      reset({
        title: '',
        description: '',
        dueDate: null,
      });
      setDateMMKV?.(undefined);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <View className={'flex-1'}>
        <View className={'flex flex-row items-center justify-between pt-6'}>
          <BackButton isClose />
          <Button
            className={'mr-4 rounded-full'}
            isIconOnly
            onPress={submit}
            isDisabled={isPrimaryDisabled}>
            <Button.Label>
              {isSaving ? (
                <ActivityIndicator size={'small'} />
              ) : (
                <Ionicons name={'checkmark-outline'} size={22} />
              )}
            </Button.Label>
          </Button>
        </View>

        <ScrollView className={''} keyboardShouldPersistTaps={'always'}>
          <View className={'p-6 pb-0'}>
            <Controller
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={inputRef}
                  onChangeText={(text) => {
                    if (formError) {
                      setFormError(null);
                    }
                    onChange(text);
                  }}
                  onBlur={onBlur}
                  value={value ?? ''}
                  placeholder={'New Task'}
                  className={
                    'w-full min-w-0 px-0 py-2 text-2xl font-semibold placeholder:text-muted-foreground/80'
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
                <Text className={'text-sm text-muted-foreground'}>Loading parent task…</Text>
              ) : parentTask ? (
                <Text className={'text-sm text-muted-foreground'}>
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
                  placeholder={'Description'}
                  className={
                    'w-full min-w-0 px-0 py-2 text-base font-medium placeholder:text-muted-foreground/80'
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

          <ScrollView
            horizontal={true}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            className={'px-6'}>
            {isSubtask ? (
              <View
                className={
                  'mr-4 flex flex-row items-center gap-2 rounded-md border border-border bg-gray-200 px-4 py-2'
                }>
                <Ionicons name={'git-branch-outline'} size={18} />
                <Text className={'max-w-[180px]'} numberOfLines={1}>
                  {parentLoading
                    ? 'Loading parent…'
                    : parentTask?.title ?? parentError?.message ?? 'Parent not found'}
                </Text>
              </View>
            ) : null}
            <View
              className={
                'mr-4 flex flex-row items-center gap-2 rounded-md border border-border bg-gray-200 px-4 py-2'
              }>
              <Ionicons name={'file-tray-outline'} size={18} />
              <Text>{activeProjectName}</Text>
            </View>

            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                router.push('/task/date-picker');
              }}
              className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-2'}>
              <Ionicons name={'calendar-outline'} size={18} />
              <Text>{dueDate === todayLocal() ? 'Today' : dueDate || 'Due Date'}</Text>
            </Pressable>

            <Pressable
              onPress={() => handlePriorityButtonPress()}
              className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-2'}>
              <Ionicons name={'flag-outline'} size={18} />
              <Text>Priority</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/task/label-select')}
              className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-2'}>
              <Ionicons name={'pricetag-outline'} size={18} />
              <Text>Label</Text>
            </Pressable>
          </ScrollView>
          {formError ? (
            <Text className={'px-6 pt-4 text-sm text-red-500'} role={'alert'}>
              {formError}
            </Text>
          ) : null}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
