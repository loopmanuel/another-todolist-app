import { Text } from '@/components/ui/text';
import { ScrollView, View } from 'react-native';
import { Button, Checkbox } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';

const list = [1, 2, 3, 4, 5];

export default function ListDetails() {
  const router = useRouter();

  return (
    <View className={'pb-safe flex-1'}>
      <ScrollView className={'flex-1 pt-6'}>
        {list.map((item, index) => (
          <View
            key={`item-${index}`}
            className={'mx-6 mb-3 flex flex-row gap-4 rounded-lg bg-white p-4'}>
            <View>
              <Checkbox isSelected={index === 1} />
            </View>
            <View className={cn(index === 1 && 'opacity-50')}>
              <Text
                className={cn('text-lg font-medium', index === 1 && 'text-gray-600 line-through')}>
                this is the item {item}
              </Text>
              <View className={'flex flex-row items-center gap-2'}>
                <View className={'flex w-fit flex-row items-center justify-center gap-1 p-1'}>
                  <Text className={'text-sm text-red-600'}>Urgent</Text>
                </View>

                <View className={'flex w-fit flex-row items-center justify-center gap-1 p-1'}>
                  <Ionicons name={'calendar-outline'} size={14} />
                  <Text className={'text-sm'}>Today</Text>
                </View>

                <View className={'flex w-fit flex-row items-center justify-center gap-1 p-1'}>
                  <Ionicons name={'pricetag-outline'} size={14} />
                  <Text className={'text-sm'}>Label here</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <View className={'mt-auto px-6 py-2'}>
        <Button variant={'secondary'} onPress={() => router.push('/task/new')}>
          <Ionicons name={'add-circle-outline'} size={24} />
          <Button.Label>Add Todo</Button.Label>
        </Button>
      </View>
    </View>
  );
}
