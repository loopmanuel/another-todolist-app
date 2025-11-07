import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import BackButton from '@/components/ui/back-button';
import { Button, Card, Checkbox } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function TaskDetails() {
  return (
    <ScrollView className={'pb-safe flex-1'}>
      <View className={'flex flex-row items-center justify-between px-6 pr-4 pt-6'}>
        <BackButton isClose />
        <Button className={'rounded-full'} isIconOnly>
          <Button.Label>
            <Ionicons name={'checkmark-outline'} size={22} />
          </Button.Label>
        </Button>
      </View>

      <Card className={'mx-6 mt-6 rounded-2xl'}>
        <Card.Body>
          <View className={'mb-4 flex flex-row items-start gap-4'}>
            <Checkbox />

            <Text className={'text-2xl font-semibold'}>Task title here</Text>
          </View>

          <View className={'flex flex-row items-center gap-2 border-b border-b-gray-200 py-3'}>
            <Ionicons name={'pricetag-outline'} size={18} />
            <Text>Label here</Text>
          </View>

          <View className={'flex flex-row items-center gap-2 border-b border-b-gray-200 py-3'}>
            <Ionicons name={'calendar-outline'} size={18} />
            <Text>Date here</Text>
          </View>

          <View className={'flex flex-row items-center gap-2 border-b-gray-200 py-3'}>
            <Ionicons name={'flag-outline'} size={18} />
            <Text>Priority here</Text>
          </View>
        </Card.Body>
      </Card>

      <View className={'mb-4 mt-6 flex flex-row items-center gap-2 px-8'}>
        <Text className={'font-semibold'}>Sub Tasks</Text>
        <Text>0/0</Text>
      </View>

      <Card className={'mx-6 rounded-2xl'}>
        <Card.Body>
          <Button variant={'tertiary'}>
            <Ionicons name="add" size={20} />
            <Button.Label>Add Subtask</Button.Label>
          </Button>
        </Card.Body>
      </Card>
    </ScrollView>
  );
}
