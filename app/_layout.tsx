import '../global.css';

import { Slot } from 'expo-router';
import { HeroUINativeProvider } from 'heroui-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppThemeProvider } from '@/contexts/app-theme-contexts';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Toaster } from 'sonner-native';

export const queryClient = new QueryClient();

export default function Layout() {
  // const { isDark } = useAppTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <AppThemeProvider>
            <HeroUINativeProvider>
              {/*<StatusBar style={isDark ? 'light' : 'dark'} />*/}
              <BottomSheetModalProvider>
                <Slot />
                {/* Toast provider should be at the root level */}
                <Toaster position="bottom-center" />
              </BottomSheetModalProvider>
            </HeroUINativeProvider>
          </AppThemeProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
