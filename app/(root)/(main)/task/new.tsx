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
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import BackButton from '@/components/ui/back-button';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMMKVString } from 'react-native-mmkv';
import { useAuthStore } from '@/store/auth-store';
import { useListsQuery } from '@/features/lists/queries/use-lists';
import { useCreateTaskMutation } from '@/features/tasks/mutations/use-create-task';

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
  const inputRef = React.useRef<TextInput>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Persisted date (shared with your date-picker screen)
  const [dateMMKV, setDateMMKV] = useMMKVString('date');
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { data: lists = [], isLoading: listsLoading } = useListsQuery(user?.id ?? undefined);
  const activeProject = lists[0];
  const activeProjectName = activeProject?.name ?? 'Inbox';

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

    if (!activeProject?.id) {
      setFormError('Create a list before adding tasks.');
      return;
    }

    try {
      await createTask({
        createdBy: user.id,
        projectId: activeProject.id,
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

  const isSaving = isSubmitting || isPending || listsLoading;

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
            isDisabled={isSaving}>
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
