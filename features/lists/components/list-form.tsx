import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import EmojiPicker, { type EmojiType } from 'rn-emoji-keyboard';

import { Button, TextField } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import BackButton from '@/components/ui/back-button';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/auth-store';
import { useListFormStore } from '@/store/list-form-store';

import { useCreateListMutation } from '../mutations/use-create-list';
import { useUpdateListMutation } from '../mutations/use-update-list';
import { useListQuery } from '../queries/use-list';
import { createListSchema, type CreateListValues } from '../validation/create-list-schema';
import { cn } from '@/lib/utils';
import { getColorName } from '../utils/colors';

type ListFormProps = {
  listId?: string;
  onSuccess?: () => void;
};

export function ListForm({ listId, onSuccess }: ListFormProps) {
  const router = useRouter();

  const isEditMode = Boolean(listId);
  const { data: existingList, isLoading: listLoading } = useListQuery(listId);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { selectedColor, setSelectedColor, clearSelectedColor } = useListFormStore();

  const {
    control,
    handleSubmit,
    clearErrors,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateListValues>({
    resolver: zodResolver(createListSchema),
    defaultValues: {
      name: '',
      icon: '📋',
      color: '',
    },
  });

  const { mutateAsync: createList, isPending: isCreating } = useCreateListMutation();
  const { mutateAsync: updateList, isPending: isUpdating } = useUpdateListMutation();
  const isPending = isCreating || isUpdating;

  // Initialize form with existing list data when editing
  React.useEffect(() => {
    if (isEditMode && existingList && !listLoading) {
      reset({
        name: existingList.name,
        icon: existingList.icon || '📋',
        color: existingList.color || '',
      });
      setSelectedColor(existingList.color);
    }
  }, [isEditMode, existingList, listLoading, reset, setSelectedColor]);

  const handleFocus = useCallback(
    (field?: keyof CreateListValues) => {
      if (field) {
        clearErrors(field);
      } else {
        clearErrors();
      }
      if (formError) {
        setFormError(null);
      }
    },
    [clearErrors, formError]
  );

  const submit = handleSubmit(async (values) => {
    if (!user?.id) {
      setFormError(`You need to be signed in to ${isEditMode ? 'update' : 'create'} a list.`);
      return;
    }

    try {
      if (isEditMode && listId) {
        await updateList({
          listId,
          ownerId: user.id,
          name: values.name,
          icon: values.icon,
          color: selectedColor ?? '#78716c',
        });
      } else {
        await createList({
          ownerId: user.id,
          name: values.name,
          icon: values.icon,
          color: selectedColor ?? '#78716c',
        });
      }

      if (!isEditMode) {
        reset({ name: '', icon: '', color: '' });
        clearSelectedColor();
      }
      setFormError(null);

      if (onSuccess) {
        onSuccess();
      } else {
        router.back();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : `Unable to ${isEditMode ? 'update' : 'create'} list.`;
      setFormError(message);
    }
  });

  const handlePick = (emojiObject: EmojiType) => {
    console.log(emojiObject);

    setValue('icon', emojiObject.emoji);

    /* example emojiObject = {
    "emoji": "❤️",
    "name": "red heart",
    "slug": "red_heart",
    "unicode_version": "0.6",
  }
*/
  };

  // Show loading state while fetching list data in edit mode
  if (isEditMode && listLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1">
      <View className="flex-1">
        <EmojiPicker onEmojiSelected={handlePick} open={isOpen} onClose={() => setIsOpen(false)} />

        <View className="flex flex-row items-center justify-between pt-6">
          <BackButton isClose />
          <Button
            className="mr-4 rounded-full"
            isIconOnly
            variant="tertiary"
            onPress={submit}
            isDisabled={isPending}>
            <Button.Label>
              {isPending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons name="checkmark-outline" size={22} />
              )}
            </Button.Label>
          </Button>
        </View>

        <ScrollView
          className="px-6"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardDismissMode={'none'}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextInput
                autoFocus
                placeholder={isEditMode ? 'List Name' : 'New List'}
                className={
                  'placeholder:text-muted-foreground/80 mt-6 w-full min-w-0 px-0 py-2 text-2xl font-semibold'
                }
                value={field.value}
                onBlur={field.onBlur}
                onFocus={() => handleFocus('name')}
                onChangeText={(value) => {
                  field.onChange(value);
                  handleFocus('name');
                }}
              />
            )}
          />

          {errors.name ? (
            <Text className="mt-1 text-sm text-red-500" role="alert">
              {errors.name.message}
            </Text>
          ) : null}

          <ScrollView
            horizontal={true}
            keyboardDismissMode={'none'}
            keyboardShouldPersistTaps={'always'}
            className={'mt-4'}
            showsHorizontalScrollIndicator={false}>
            <Controller
              render={({ field }) => (
                <Pressable
                  onPress={() => {
                    setIsOpen(true);
                  }}
                  className={cn(
                    'border-border mr-4 flex flex-row items-center gap-2 rounded-md border bg-gray-200 px-4 py-2'
                  )}>
                  <Text numberOfLines={1}>{field.value ? field.value : 'Select Icon'}</Text>
                </Pressable>
              )}
              name={'icon'}
              control={control}
            />

            <Pressable
              onPress={() => {
                Keyboard.dismiss();
                router.push('/pickers/color-picker');
              }}
              className={cn(
                'border-border mr-4 flex flex-row items-center gap-2 rounded-md border bg-gray-200 px-4 py-2'
              )}>
              <View
                className={'h-5 w-5 rounded-full'}
                style={{ backgroundColor: selectedColor || '#9ca3af' }}></View>

              <Text numberOfLines={1}>{getColorName(selectedColor)}</Text>
            </Pressable>
          </ScrollView>

          {formError ? (
            <Text className="mt-4 text-sm text-red-500" role="alert">
              {formError}
            </Text>
          ) : null}
        </ScrollView>

        <View className="border-border border-t px-6 py-4">
          <Button className="rounded-full bg-black" onPress={submit} isDisabled={isPending}>
            <Button.Label>
              {isPending
                ? isEditMode
                  ? 'Updating…'
                  : 'Creating…'
                : isEditMode
                  ? 'Update List'
                  : 'Create List'}
            </Button.Label>
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
