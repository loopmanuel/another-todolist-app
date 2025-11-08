import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlashList } from '@shopify/flash-list';
import BackButton from '@/components/ui/back-button';

export default function LabelSelect() {
  const router = useRouter();

  return (
    <ScrollView className={'pb-safe flex-1'}>
      <View className={'flex flex-row items-center justify-between pb-6 pt-6'}>
        <BackButton isClose />

        <Text className={'text-xl font-semibold'}>Choose Label</Text>

        <Button className={'mr-4'} size={'sm'} variant={'tertiary'}>
          <Button.Label>Clear</Button.Label>
        </Button>
      </View>

      <FlashList
        renderItem={({ item }) => {
          return (
            <Pressable className={'mx-6 flex flex-row items-center gap-2 py-2'}>
              <Ionicons name={'checkmark-outline'} size={18} />
              <Text>⚡</Text>
              <Text>List title</Text>
            </Pressable>
          );
        }}
        data={[1, 2, 3, 4]}
      />
    </ScrollView>
  );
}
