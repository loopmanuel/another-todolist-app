import { Stack, useRouter } from 'expo-router';
import { Pressable, useWindowDimensions } from 'react-native';
import { Button, useThemeColor } from 'heroui-native';
import { useAppTheme } from '@/contexts/app-theme-contexts';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function AppLayout() {
  const { height } = useWindowDimensions();
  const router = useRouter();

  const { isDark } = useAppTheme();
  const themeColorForeground = useThemeColor('foreground');
  const themeColorBackground = useThemeColor('background');

  return (
    <Stack
      screenOptions={{
        headerTintColor: themeColorForeground,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: {
          backgroundColor: themeColorBackground,
        },
        headerLargeTitle: true,
        headerTransparent: true,
        // headerBlurEffect: 'systemChromeMaterial',
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: true,
        headerLargeStyle: {
          // NEW: Make the large title transparent to match the background.
          backgroundColor: 'transparent',
        },
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: '',
          headerShown: true,
          headerLeft: () => (
            <Pressable className={'px-2.5'} onPress={() => router.push('/settings')}>
              <Ionicons name={'settings-outline'} size={20} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable className={'px-2.5'} onPress={() => router.push('/search')}>
              <Ionicons name={'search-outline'} size={20} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="upcoming"
        options={{
          title: 'Upcoming',
          headerLargeTitle: false,
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
          headerLargeTitle: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="lists/new"
        options={{
          title: 'Add List',
          presentation: 'modal',
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="lists/edit"
        options={{
          title: 'Edit List',
          presentation: 'modal',
          sheetCornerRadius: 30,
          headerTransparent: true,
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
          headerShown: true,
          headerTransparent: true,
          sheetExpandsWhenScrolledToEdge: true,
          headerLeft: () => (
            <Pressable className={'px-2'} onPress={() => router.dismiss()}>
              <Ionicons name={'close-outline'} size={24} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="task/new"
        options={{
          title: '',
          presentation: 'modal',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: false,
          sheetCornerRadius: 30,
          headerShown: true,
          headerTransparent: true,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="pickers/date-picker"
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
        name="pickers/time-picker"
        options={{
          title: 'Choose Time',
          presentation: 'modal',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="pickers/priority-select"
        options={{
          title: 'Choose Priority',
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
          sheetCornerRadius: 30,
          headerShown: true,
          sheetExpandsWhenScrolledToEdge: false,
          headerLargeTitle: false,
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="pickers/inbox-picker"
        options={{
          title: 'Choose List',
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="pickers/pick-label"
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
        name="pickers/color-picker"
        options={{
          title: 'Choose Color',
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
          sheetCornerRadius: 30,
          headerShown: true,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="today"
        options={{
          title: 'Today',
          headerLargeTitle: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          headerLargeTitle: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name="test-route"
        options={{
          title: 'New Routes',
          headerLargeTitle: true,
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
