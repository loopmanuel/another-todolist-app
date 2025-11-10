import { Stack } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { useThemeColor } from 'heroui-native';
import { useAppTheme } from '@/contexts/app-theme-contexts';

export default function MainLayout() {
  const { height } = useWindowDimensions();

  const { isDark } = useAppTheme();
  const themeColorForeground = useThemeColor('foreground');
  const themeColorBackground = useThemeColor('background');

  return (
    <Stack
      screenOptions={{
        headerBlurEffect: isDark ? 'dark' : 'light',
        headerTintColor: themeColorForeground,
        contentStyle: {
          backgroundColor: themeColorBackground,
        },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="today"
        options={{
          title: 'Today',
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          headerTransparent: true,
          headerTintColor: 'black',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="theme"
        options={{
          title: 'Themes',
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="search"
        options={{
          presentation: 'modal',
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="lists/[id]"
        options={{
          title: 'Lists Details',
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="lists/new"
        options={{
          title: '',
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: false,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="lists/edit"
        options={{
          title: '',
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: false,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="task/[id]"
        options={{
          title: '',
          presentation: 'modal',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: true,
        }}
      />
      <Stack.Screen
        name="task/new"
        options={{
          title: '',
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: false,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="task/date-picker"
        options={{
          title: 'Choose Date',
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="task/priority-select"
        options={{
          title: 'Choose Priority',
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
          sheetCornerRadius: 30,
          headerShown: true,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="labels/pick-label"
        options={{
          title: 'Pick Labels',
          presentation: 'modal',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: true,
        }}
      />
      <Stack.Screen
        name="lists/color-picker"
        options={{
          title: 'Choose Color',
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
    </Stack>
  );
}
