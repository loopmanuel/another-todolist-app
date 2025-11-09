import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Stack } from 'expo-router';

import { useAuthStore } from '@/store/auth-store';
import { StatusBar } from 'expo-status-bar';
import { useAppTheme } from '@/contexts/app-theme-contexts';

export default function RootLayout() {
  const { isDark } = useAppTheme();

  const { status, initialize } = useAuthStore((state) => ({
    status: state.status,
    initialize: state.initialize,
    initialized: state.initialized,
  }));

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (status === 'loading') {
    return (
      <View className="flex flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={status === 'unauthenticated'}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={status === 'authenticated'}>
          <Stack.Screen name="(main)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}
