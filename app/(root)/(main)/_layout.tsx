import { Stack } from 'expo-router';
import { useWindowDimensions } from 'react-native';

export default function MainLayout() {
  const { height } = useWindowDimensions();
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
          sheetAllowedDetents: height > 700 ? [0.2] : 'fitToContents',
          sheetGrabberVisible: false,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="task/new"
        options={{
          title: '',
          presentation: 'formSheet',
          sheetAllowedDetents: height > 700 ? [0.25] : 'fitToContents',
          sheetGrabberVisible: false,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
    </Stack>
  );
}
