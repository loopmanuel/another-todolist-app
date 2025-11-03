import { Stack, Link, useRouter } from 'expo-router';

import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import NewFab from '@/components/new-fab';

export default function Home() {
  const router = useRouter();

  return (
    <View className={'flex flex-1 bg-white'}>
      <NewFab />
      <Stack.Screen
        options={{
          headerTitle: 'November 2nd',
          headerLeft: () => (
            <View className={'pl-4'}>
              <Button variant={'tertiary'} isIconOnly className={'rounded-full'}>
                <Button.Label>
                  <Ionicons name={'settings-outline'} size={22} />
                </Button.Label>
              </Button>
            </View>
          ),
          headerRight: () => (
            <View className={'pr-4'}>
              <Button variant={'tertiary'} isIconOnly className={'rounded-full'}>
                <Button.Label>
                  <Ionicons name={'search-outline'} size={20} />
                </Button.Label>
              </Button>
            </View>
          ),
          headerShadowVisible: false,
        }}
      />
      <ScrollView className={'pt-safe flex-1 px-6'}>
        <View>
          <TouchableOpacity className={'flex flex-row items-center gap-4'}>
            <View className={'flex h-12 w-14 items-center justify-center rounded-lg bg-white'}>
              <Ionicons name={'file-tray-outline'} size={22} />
            </View>
            <Text variant={'large'}>Inbox</Text>
          </TouchableOpacity>

          <TouchableOpacity className={'flex flex-row items-center gap-4'}>
            <View className={'flex h-12 w-14 items-center justify-center rounded-lg bg-white'}>
              <Ionicons name={'today-outline'} size={22} />
            </View>
            <Text variant={'large'}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity className={'flex flex-row items-center gap-4'}>
            <View className={'flex h-12 w-14 items-center justify-center rounded-lg bg-white'}>
              <Ionicons name={'calendar-outline'} size={22} />
            </View>
            <Text variant={'large'}>Upcoming</Text>
          </TouchableOpacity>
        </View>

        <View className={'mt-6'}>
          <View className={'mb-4 flex flex-row items-center gap-4'}>
            <Text className={'border-none text-xl font-semibold text-gray-600'}>Favorites</Text>
          </View>

          <TouchableOpacity
            className={'mb-2 flex flex-row items-center gap-4'}
            onPress={() => router.push('/lists/1')}>
            <View className={'flex h-14 w-14 items-center justify-center rounded-lg bg-gray-200'}>
              <Text className={''}>📥</Text>
            </View>
            <Text variant={'large'}>Project one</Text>
          </TouchableOpacity>
        </View>

        <View className={'mt-6'}>
          <Text variant={'h3'} className={'mb-4 border-none text-xl font-semibold text-gray-600'}>
            Lists
          </Text>

          <TouchableOpacity className={'mb-2 flex flex-row items-center gap-4'}>
            <View className={'flex h-14 w-14 items-center justify-center rounded-lg bg-gray-200'}>
              <Text className={''}>📥</Text>
            </View>
            <Text variant={'large'}>Project one</Text>
          </TouchableOpacity>

          <TouchableOpacity className={'mb-2 flex flex-row items-center gap-4'}>
            <View className={'flex h-14 w-14 items-center justify-center rounded-lg bg-gray-200'}>
              <Text className={''}>📥</Text>
            </View>
            <Text variant={'large'}>Project one</Text>
          </TouchableOpacity>

          <TouchableOpacity className={'mb-2 flex flex-row items-center gap-4'}>
            <View
              className={
                'bg-gray-00 flex h-14 w-14 items-center justify-center rounded-lg bg-gray-200'
              }>
              <Text className={''}>📥</Text>
            </View>
            <Text variant={'large'}>Project one</Text>
          </TouchableOpacity>

          <Button variant={'tertiary'} className={'mt-4'} onPress={() => router.push('/lists/new')}>
            <Ionicons name={'add-circle-outline'} size={24} />
            <Button.Label>New List</Button.Label>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
