import React, { useCallback } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'heroui-native';
import { Href, Stack, useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import NewFab from '@/components/new-fab';
import { ListTile } from '@/features/lists/components/list-tile';
import { useListsQuery } from '@/features/lists/queries/use-lists';
import { useProjectTaskCountsQuery } from '@/features/tasks/queries/use-project-task-counts';
import type { Tables } from '@/supabase/database.types';
import { useAuthStore } from '@/store/auth-store';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Route = Href;

type MainHeaderItem = {
  icon: IconName;
  title: 'Inbox' | 'Today' | 'Upcoming';
  to?: Route;
  onPress?: () => void;
  badgeCount?: number;
};

// ---------- Data (type-safe via `satisfies`) ----------
const mainHeaderList = [
  {
    icon: 'file-tray-outline',
    title: 'Inbox',
    // to: '/inbox' as const,  // uncomment if/when you have an inbox route
  },
  {
    icon: 'today-outline',
    title: 'Today',
    to: '/today' as const,
  },
  {
    icon: 'calendar-outline',
    title: 'Upcoming',
    to: '/upcoming' as const,
  },
] satisfies readonly MainHeaderItem[];

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore((state) => ({
    user: state.user,
  }));
  const { data: lists = [], isLoading } = useListsQuery(user?.id ?? undefined);
  const { data: taskCounts = {} } = useProjectTaskCountsQuery(user?.id);

  const handleListPress = useCallback(
    (listId: string) => {
      router.push({ pathname: '/lists/[id]', params: { id: listId } });
    },
    [router]
  );

  const renderListItem = useCallback<ListRenderItem<Tables<'projects'>>>(
    ({ item }) => (
      <ListTile
        list={item}
        onPress={() => handleListPress(item.id)}
        uncompletedCount={taskCounts[item.id] || 0}
      />
    ),
    [handleListPress, taskCounts]
  );

  return (
    <View className={'bg-background relative flex-1'}>
      <Stack.Screen
        options={{
          headerTitle: '',
          headerTransparent: true,
          headerLeft: () => (
            <Button
              variant={'tertiary'}
              isIconOnly
              className={'ml-4 rounded-full'}
              size={'md'}
              onPress={() => router.push('/settings')}>
              <Button.Label>
                <Ionicons name={'settings-outline'} size={22} />
              </Button.Label>
            </Button>
          ),
          headerRight: () => (
            <Button
              variant={'tertiary'}
              isIconOnly
              className={'mr-4 rounded-full'}
              onPress={() => router.push('/search')}>
              <Button.Label>
                <Ionicons name={'search-outline'} size={20} />
              </Button.Label>
            </Button>
          ),
          headerShadowVisible: false,
        }}
      />

      <NewFab />

      <FlashList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View>
            <View className={'h-8'} />
            <View className={'mb-4 mt-6'}>
              <Text className="border-none text-base font-semibold">Quick Access</Text>
            </View>
            <View className="flex flex-row gap-4">
              {mainHeaderList.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  className="bg-surface flex flex-1 flex-col items-center rounded-2xl py-2">
                  <View className="bg-overlay flex h-11 w-11 items-center justify-center rounded-lg">
                    <Ionicons name={item.icon} size={22} />
                  </View>
                  <Text className={'text-base font-semibold'}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className={'mb-4 mt-6'}>
              <Text className="border-none text-base font-semibold">Lists</Text>
            </View>
          </View>
        )}
        nestedScrollEnabled={true}
        contentContainerStyle={{
          paddingTop: 100,
          paddingBottom: 120,
          paddingHorizontal: 16,
        }}
        ListEmptyComponent={
          lists.length === 0 ? (
            <View className="py-8">
              {isLoading ? (
                <ActivityIndicator />
              ) : (
                <View className="border-border rounded-2xl border border-dashed p-6">
                  <Text className="text-muted-foreground text-center text-base">
                    Create your first list to keep things organized.
                  </Text>
                </View>
              )}
            </View>
          ) : null
        }
        ListFooterComponent={
          <View className="pb-safe mt-2 gap-3">
            <Button variant={'tertiary'} onPress={() => router.push('/lists/new')}>
              <Ionicons name={'add-circle-outline'} size={24} />
              <Button.Label>New List</Button.Label>
            </Button>
          </View>
        }
      />
    </View>
  );
}
