import { Stack } from 'expo-router';

export default function SettingLayout() {
  return (
    <Stack>
      <Stack.Screen name={'index'} options={{ title: 'Settings' }} />
    </Stack>
  );
}
