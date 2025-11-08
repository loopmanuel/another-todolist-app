import '../global.css';

import { Slot } from 'expo-router';
import { HeroUINativeProvider } from 'heroui-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from '@/contexts/app-theme-contexts';

export const queryClient = new QueryClient();

export default function Layout() {
  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <AppThemeProvider>
            <HeroUINativeProvider>
              <Slot />
            </HeroUINativeProvider>
          </AppThemeProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
