import { Stack, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name={'index'}
        options={{
          title: 'Settings',
          headerTransparent: true,
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: true,
        }}
      />
      <Stack.Screen name={'appearance'} options={{ title: 'Appearance' }} />
      <Stack.Screen name={'labels'} options={{ title: 'Labels' }} />
      <Stack.Screen name={'notifications'} options={{ title: 'Notifications' }} />
      <Stack.Screen
        name={'new-label'}
        options={{
          title: 'New Label',
          presentation: 'modal',
          headerTransparent: true,
          headerLeft: () => (
            <Pressable className={'px-2'} onPress={() => router.back()}>
              <Ionicons name={'close-outline'} size={24} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name={'edit-label'}
        options={{
          title: 'Edit Label',
          presentation: 'modal',
          headerTransparent: true,
          headerLeft: () => (
            <Pressable className={'px-2'} onPress={() => router.back()}>
              <Ionicons name={'close-outline'} size={24} />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
