import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen
        name={'test-route'}
        options={{
          title: 'New Routes',
          headerLargeTitle: true,
          headerTransparent: true,
        }}
      />
      <Stack.Screen
        name={'today'}
        options={{
          title: 'Today',
          headerLargeTitle: true,
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}
