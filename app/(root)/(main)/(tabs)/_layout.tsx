import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name={"index"}
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size, focused }) =>
                        focused ? (
                            <Ionicons name="card" size={size} color={color} />
                        ) : (
                            <Ionicons name="card-outline" size={size} color={color} />
                        ),
                }}
            />
        </Tabs>
    );
}
