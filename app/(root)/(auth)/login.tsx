import { useCallback, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';

import { Link } from 'expo-router';
import { Button, TextField } from 'heroui-native';

import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/auth-store';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter your email and password.')
    .email('Please enter a valid email address.'),
  password: z.string().min(1, 'Please enter your email and password.'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { signIn, submitting, error, clearError } = useAuthStore((state) => ({
    signIn: state.signIn,
    submitting: state.submitting,
    error: state.error,
    clearError: state.clearError,
  }));

  const {
    control,
    handleSubmit,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const clearMessages = useCallback(() => {
    clearErrors();
    if (error) {
      clearError();
    }
  }, [clearErrors, clearError, error]);

  const onSubmit = handleSubmit(async (values) => {
    const { error: signInError } = await signIn({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });

    if (!signInError) {
      reset({ email: values.email.trim().toLowerCase(), password: '' });
    }
  });

  const message = error;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 32 : 0}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex flex-1 justify-center px-6 py-10">
          <View className="mb-10">
            <Text variant="h1" className="text-left text-3xl font-bold">
              Welcome back 👋
            </Text>
            <Text className="mt-2 text-base text-muted-foreground">
              Sign in to keep your tasks on track.
            </Text>
          </View>

          <View className="gap-5">
            <TextField>
              <TextField.Label>Email</TextField.Label>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <TextField.Input
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    value={field.value}
                    onBlur={field.onBlur}
                    onFocus={clearMessages}
                    onChangeText={(value) => {
                      clearMessages();
                      field.onChange(value);
                    }}
                  />
                )}
              />
            </TextField>
            {errors.email ? (
              <Text className="text-sm text-red-500" role="alert">
                {errors.email.message}
              </Text>
            ) : null}

            <TextField>
              <TextField.Label>Password</TextField.Label>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <TextField.Input
                    placeholder="••••••••"
                    secureTextEntry
                    value={field.value}
                    onBlur={field.onBlur}
                    onFocus={clearMessages}
                    onChangeText={(value) => {
                      clearMessages();
                      field.onChange(value);
                    }}
                  />
                )}
              />
            </TextField>
            {errors.password ? (
              <Text className="text-sm text-red-500" role="alert">
                {errors.password.message}
              </Text>
            ) : null}
          </View>

          {message ? (
            <Text className="mt-4 text-sm text-red-500" role="alert">
              {message}
            </Text>
          ) : null}

          <Button
            className="mt-8 rounded-full bg-black"
            onPress={onSubmit}
            isDisabled={submitting}>
            <Button.Label>{submitting ? 'Signing in…' : 'Sign In'}</Button.Label>
          </Button>

          <View className="mt-6 flex flex-row items-center justify-center gap-2">
            <Text className="text-muted-foreground">Need an account?</Text>
            <Link href="/signup" asChild>
              <TouchableOpacity>
                <Text className="font-semibold text-black">Create one</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
