import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useListFormStore } from '@/store/list-form-store';
import { cn } from '@/lib/utils';
import { COLORS } from '@/features/lists/utils/colors';
import { LegendList } from '@legendapp/list';

export default function ColorPicker() {
  const router = useRouter();
  const { selectedColor: storeColor, setSelectedColor } = useListFormStore();
  const [selectedColor, setLocalColor] = useState<string | null>(storeColor);

  const handleSelectColor = (color: string | null) => {
    setLocalColor(color);
    setSelectedColor(color);
    router.back();
  };

  return (
    <View className="bg-background">
      <Stack.Screen
        options={{
          title: 'Choose Color',
          headerShown: true,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="px-2">
              <Ionicons name="close-outline" size={24} />
            </Pressable>
          ),
        }}
      />

      <LegendList
        data={COLORS}
        numColumns={3}
        renderItem={({ item: color }) => {
          const isSelected = selectedColor === color.value;
          const displayColor = color.value || '#9ca3af'; // Default gray for null

          return (
            <Pressable
              key={color.name}
              onPress={() => handleSelectColor(color.value)}
              className={cn(
                'items-center justify-center rounded-lg p-4',
                isSelected && 'border-2 border-blue-500'
              )}>
              <View
                className="mb-2 h-12 w-12 rounded-full"
                style={{ backgroundColor: displayColor }}
              />
              <Text className="text-center text-sm font-medium">{color.name}</Text>
              {isSelected && (
                <View className="absolute right-2 top-2">
                  <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                </View>
              )}
            </Pressable>
          );
        }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 40,
        }}
      />
    </View>
  );
}
