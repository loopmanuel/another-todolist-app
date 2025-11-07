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
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: false,
          sheetCornerRadius: 30,
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
        }}
      />
      <Stack.Screen
        name="task/label-select"
        options={{
          title: 'Choose Label',
          presentation: 'formSheet',
          sheetAllowedDetents: 'fitToContents',
          sheetGrabberVisible: true,
          sheetCornerRadius: 30,
          headerShown: true,
          sheetExpandsWhenScrolledToEdge: false,
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
    </Stack>
  );
}
