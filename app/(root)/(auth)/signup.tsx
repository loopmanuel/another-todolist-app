import { useCallback, useEffect, useState } from 'react';
import { KeyboardAvoidingView, TouchableOpacity, View } from 'react-native';

import { Link } from 'expo-router';
import { Button, TextField } from 'heroui-native';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/auth-store';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const signupSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Please fill in all fields.')
      .email('Please enter a valid email address.'),
    password: z
      .string()
      .min(1, 'Please fill in all fields.')
      .min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(1, 'Please fill in all fields.'),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
      });
    }
  });

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const [info, setInfo] = useState<string | null>(null);

  const { signUp, submitting, error, clearError } = useAuthStore((state) => ({
    signUp: state.signUp,
    submitting: state.submitting,
    error: state.error,
    clearError: state.clearError,
  }));

  const {
    control,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const clearMessages = useCallback(() => {
    setInfo(null);
    clearErrors();
    if (error) {
      clearError();
    }
  }, [clearErrors, clearError, error]);

  const onSubmit = handleSubmit(async (values) => {
    setInfo(null);

    const { error: signUpError, requiresConfirmation } = await signUp({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });

    if (signUpError) {
      return;
    }

    if (requiresConfirmation) {
      setInfo('Check your email inbox to confirm your account before signing in.');
    } else {
      setInfo('Account created successfully.');
    }

    reset({
      email: values.email.trim().toLowerCase(),
      password: '',
      confirmPassword: '',
    });
  });

  const message = error;

  return (
    <KeyboardAwareScrollView className="pt-safe flex-1 bg-white px-6">
      <View className="mt-safe mb-10">
        <Text variant="h1" className="text-left text-3xl font-bold">
          Create an account ✨
        </Text>
        <Text className="mt-2 text-base text-muted-foreground">
          Get started with smarter task management.
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
          <Text className="mt-1 text-sm text-red-500" role="alert">
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
          <Text className="mt-1 text-sm text-red-500" role="alert">
            {errors.password.message}
          </Text>
        ) : null}

        <TextField>
          <TextField.Label>Confirm password</TextField.Label>
          <Controller
            control={control}
            name="confirmPassword"
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
        {errors.confirmPassword ? (
          <Text className="mt-1 text-sm text-red-500" role="alert">
            {errors.confirmPassword.message}
          </Text>
        ) : null}
      </View>

      {message ? (
        <Text className="mt-4 text-sm text-red-500" role="alert">
          {message}
        </Text>
      ) : null}

      {info ? <Text className="mt-3 text-sm text-emerald-600">{info}</Text> : null}

      <Button className="mt-8 rounded-full bg-black" onPress={onSubmit} isDisabled={submitting}>
        <Button.Label>{submitting ? 'Signing up…' : 'Create Account'}</Button.Label>
      </Button>

      <View className="mt-6 flex flex-row items-center justify-center gap-2">
        <Text className="text-muted-foreground">Already have an account?</Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text className="font-semibold text-black">Sign in</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAwareScrollView>
  );
}
