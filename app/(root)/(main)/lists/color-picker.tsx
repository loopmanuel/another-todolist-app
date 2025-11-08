import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/ui/back-button';
import { useListFormStore } from '@/store/list-form-store';
import { cn } from '@/lib/utils';
import { COLORS } from '@/features/lists/utils/colors';

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
    <View className="pb-safe flex-1 bg-gray-50">
      <View className="flex flex-row items-center justify-between bg-white px-6 pb-4 pt-6">
        <BackButton />
        <Text className="text-xl font-semibold">Choose Color</Text>
        <View style={{ width: 40 }} />
      </View>

      <View className="px-6 pt-6">
        <View className="flex flex-row flex-wrap gap-3">
          {COLORS.map((color) => {
            const isSelected = selectedColor === color.value;
            const displayColor = color.value || '#9ca3af'; // Default gray for null

            return (
              <Pressable
                key={color.name}
                onPress={() => handleSelectColor(color.value)}
                className={cn(
                  'items-center justify-center rounded-lg bg-white p-3',
                  isSelected && 'border-2 border-blue-500'
                )}
                style={{ width: '30%' }}>
                <View
                  className="mb-2 h-12 w-12 rounded-full"
                  style={{ backgroundColor: displayColor }}
                />
                <Text className="text-center text-sm font-medium">{color.name}</Text>
                {color.isDefault && (
                  <Text className="text-center text-xs text-gray-500">Default</Text>
                )}
                {isSelected && (
                  <View className="absolute right-2 top-2">
                    <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
