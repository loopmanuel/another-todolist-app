import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '@/components/ui/back-button';
import { useTaskFormStore } from '@/store/task-form-store';
import { PRIORITY_CONFIG } from '@/features/tasks/utils/priority';
import { cn } from '@/lib/utils';
import { Card } from 'heroui-native';

type PriorityOption = {
  value: number;
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
};

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    value: 0,
    label: PRIORITY_CONFIG[0].label,
    color: PRIORITY_CONFIG[0].color,
    icon: 'remove-outline',
    description: 'Task has no specific priority',
  },
  {
    value: 1,
    label: PRIORITY_CONFIG[1].label,
    color: PRIORITY_CONFIG[1].color,
    icon: 'flag-outline',
    description: 'Low priority task',
  },
  {
    value: 2,
    label: PRIORITY_CONFIG[2].label,
    color: PRIORITY_CONFIG[2].color,
    icon: 'flag',
    description: 'Medium priority task',
  },
  {
    value: 3,
    label: PRIORITY_CONFIG[3].label,
    color: PRIORITY_CONFIG[3].color,
    icon: 'flag',
    description: 'High priority task - needs attention',
  },
];

export default function PrioritySelect() {
  const router = useRouter();
  const { priority: storePriority, setPriority } = useTaskFormStore();
  const [selectedPriority, setSelectedPriority] = useState(storePriority);

  const handleSelectPriority = (priority: number) => {
    setSelectedPriority(priority);
    setPriority(priority);
    router.dismiss();
  };

  return (
    <View className="pb-safe flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable className={'px-1 py-1'} onPress={() => router.dismiss()}>
              <Ionicons name={'chevron-back-outline'} size={24} />
            </Pressable>
          ),
        }}
      />

      <View className="px-6 pt-6">
        {PRIORITY_OPTIONS.map((option) => {
          const isSelected = selectedPriority === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelectPriority(option.value)}
              className={'mb-3'}>
              <Card className={cn(isSelected && 'border-2 border-black')}>
                <Card.Body className={'flex flex-row items-center gap-4'}>
                  <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: option.color + '20' }}>
                    <Ionicons name={option.icon} size={24} color={option.color} />
                  </View>

                  <View className="flex-1">
                    <Text className="text-lg font-semibold" style={{ color: option.color }}>
                      {option.label}
                    </Text>
                    <Text className="text-sm text-gray-600">{option.description}</Text>
                  </View>

                  {isSelected && <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />}
                </Card.Body>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
