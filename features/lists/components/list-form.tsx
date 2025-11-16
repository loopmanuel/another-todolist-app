import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import EmojiPicker, { type EmojiType } from 'rn-emoji-keyboard';

import { Card } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/auth-store';
import { useListFormStore } from '@/store/list-form-store';

import { useCreateListMutation } from '../mutations/use-create-list';
import { useUpdateListMutation } from '../mutations/use-update-list';
import { useListQuery } from '../queries/use-list';
import { createListSchema, type CreateListValues } from '../validation/create-list-schema';
import { COLORS } from '@/features/lists/utils/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ListFormProps = {
  listId?: string;
  onSuccess?: () => void;
  onSubmitRef?: React.MutableRefObject<(() => void) | null>;
  onClose?: () => void;
};

export function ListForm({ listId, onSuccess, onSubmitRef, onClose }: ListFormProps) {
  const router = useRouter();

  const isEditMode = Boolean(listId);
  const { data: existingList, isLoading: listLoading } = useListQuery(listId);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const inset = useSafeAreaInsets();

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

  // Expose submit handler to parent via ref
  React.useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef.current = submit;
    }
  }, [onSubmitRef, submit]);

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
      <View className="flex-1" style={{ paddingTop: inset.top }}>
        <EmojiPicker onEmojiSelected={handlePick} open={isOpen} onClose={() => setIsOpen(false)} />

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
                placeholder={isEditMode ? 'List Name' : 'Enter list name'}
                className={
                  'placeholder:text-muted-foreground/80 mt-6 w-full min-w-0 px-2 py-2 text-2xl font-semibold'
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

          <Controller
            control={control}
            name="icon"
            render={({ field }) => (
              <Card className={'mt-4'}>
                <Card.Body>
                  <Pressable
                    className={'flex-row items-center justify-between'}
                    onPress={() => setIsOpen(true)}>
                    <Text>Icon</Text>
                    <Text className="text-2xl">{field.value || '📋'}</Text>
                  </Pressable>
                </Card.Body>
              </Card>
            )}
          />

          <Card className={'mt-4'}>
            <Card.Body>
              <Text>List Color</Text>

              <View className="mt-4 flex-row flex-wrap gap-3">
                {COLORS.map((color) => (
                  <Pressable
                    key={color.value}
                    className="items-center justify-center"
                    onPress={() => setSelectedColor(color.value)}>
                    <View
                      style={{
                        backgroundColor: color.value || COLORS[0].value!,
                        width: 38,
                        height: 38,
                        borderRadius: 24,
                        borderWidth: selectedColor === color.value ? 3 : 0,
                        borderColor: '#000',
                      }}
                    />
                  </Pressable>
                ))}
              </View>
            </Card.Body>
          </Card>

          {errors.name ? (
            <Text className="mt-1 text-sm text-red-500" role="alert">
              {errors.name.message}
            </Text>
          ) : null}

          {formError ? (
            <Text className="mt-4 text-sm text-red-500" role="alert">
              {formError}
            </Text>
          ) : null}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
