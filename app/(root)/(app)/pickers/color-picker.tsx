import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/ui/back-button';
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
    <View className="flex-1 bg-gray-100">
      <View className="flex flex-row items-center justify-between bg-white px-4 pb-4 pt-4">
        <BackButton />
        <Text className="text-xl font-semibold">Choose Color</Text>
        <View style={{ width: 40 }} />
      </View>

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
                'items-center justify-center rounded-lg bg-white p-3',
                isSelected && 'border-2 border-blue-500'
              )}>
              <View
                className="mb-2 h-10 w-10 rounded-full"
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
          paddingBottom: 120,
        }}
      />
    </View>
  );
}
