import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Button, TextField } from 'heroui-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import BackButton from '@/components/ui/back-button';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/auth-store';

import { useCreateListMutation } from '../mutations/use-create-list';
import { createListSchema, type CreateListValues } from '../validation/create-list-schema';

type ListFormProps = {
  onSuccess?: () => void;
};

export function ListForm({ onSuccess }: ListFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const { user } = useAuthStore((state) => ({ user: state.user }));

  const {
    control,
    handleSubmit,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<CreateListValues>({
    resolver: zodResolver(createListSchema),
    defaultValues: {
      name: '',
      icon: '',
      color: '',
    },
  });

  const { mutateAsync: createList, isPending } = useCreateListMutation();

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
      setFormError('You need to be signed in to create a list.');
      return;
    }

    try {
      await createList({
        ownerId: user.id,
        name: values.name,
        icon: values.icon,
        color: values.color,
      });

      reset({ name: '', icon: '', color: '' });
      setFormError(null);

      if (onSuccess) {
        onSuccess();
      } else {
        router.back();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create list.';
      setFormError(message);
    }
  });

  return (
    <KeyboardAvoidingView className="flex-1">
      <View className="flex-1">
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
          contentContainerStyle={{ paddingBottom: 24 }}>
          <TextField className="mt-6">
            <TextField.Label>List name</TextField.Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <TextField.Input
                  autoFocus
                  placeholder="My next big project"
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
          </TextField>
          {errors.name ? (
            <Text className="mt-1 text-sm text-red-500" role="alert">
              {errors.name.message}
            </Text>
          ) : null}

          <TextField className="mt-6">
            <TextField.Label>Icon</TextField.Label>
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <TextField.Input
                  placeholder="Coming soon"
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onFocus={() => handleFocus('icon')}
                  onChangeText={(value) => {
                    field.onChange(value);
                    handleFocus('icon');
                  }}
                />
              )}
            />
          </TextField>

          <TextField className="mt-6">
            <TextField.Label>Color</TextField.Label>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <TextField.Input
                  placeholder="#000000"
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onFocus={() => handleFocus('color')}
                  onChangeText={(value) => {
                    field.onChange(value);
                    handleFocus('color');
                  }}
                />
              )}
            />
          </TextField>

          {formError ? (
            <Text className="mt-4 text-sm text-red-500" role="alert">
              {formError}
            </Text>
          ) : null}
        </ScrollView>

        <View className="border-t border-border px-6 py-4">
          <Button
            className="rounded-full bg-black"
            onPress={submit}
            isDisabled={isPending}>
            <Button.Label>{isPending ? 'Creating…' : 'Create List'}</Button.Label>
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
