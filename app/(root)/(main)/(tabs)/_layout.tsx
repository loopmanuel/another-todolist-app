import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name={'index'}
        options={{
          title: '',
          headerShown: true,
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <Ionicons name="home" size={size} color={color} />
            ) : (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name={'update'}
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <Ionicons name="notifications" size={size} color={color} />
            ) : (
              <Ionicons name="notifications-outline" size={size} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
