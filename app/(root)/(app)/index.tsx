import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'heroui-native';
import { Href, useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import NewFab from '@/components/new-fab';
import { ListTile } from '@/features/lists/components/list-tile';
import { useListsQuery } from '@/features/lists/queries/use-lists';
import { useProjectTaskCountsQuery } from '@/features/tasks/queries/use-project-task-counts';
import { useViewTaskCountsQuery } from '@/features/tasks/queries/use-view-task-counts';
import { useReorderListsMutation } from '@/features/lists/mutations/use-reorder-lists';
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
  color: string;
};

// ---------- Data (type-safe via `satisfies`) ----------
const mainHeaderList = [
  {
    icon: 'file-tray-outline',
    title: 'Inbox',
    to: '/inbox' as const,
    color: '#3b82f6',
  },
  {
    icon: 'today-outline',
    title: 'Today',
    to: '/today' as const,
    color: '#10b981', // green
  },
  {
    icon: 'calendar-outline',
    title: 'Upcoming',
    to: '/upcoming' as const,
    color: '#f59e0b', // amber
  },
] satisfies readonly MainHeaderItem[];

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore((state) => ({
    user: state.user,
  }));
  const { data: lists = [], isLoading } = useListsQuery(user?.id ?? undefined);
  const { data: taskCounts = {} } = useProjectTaskCountsQuery(user?.id);
  const { data: viewCounts } = useViewTaskCountsQuery(user?.id);
  const { mutateAsync: reorderLists } = useReorderListsMutation();

  // Separate favorites from regular lists
  const { favoriteLists, regularLists } = useMemo(() => {
    const favorites = lists.filter((list) => list.is_favorite);
    const regular = lists.filter((list) => !list.is_favorite);
    return { favoriteLists: favorites, regularLists: regular };
  }, [lists]);

  const handleListDragEnd = useCallback(
    async ({ data }: { data: Tables<'projects'>[] }) => {
      if (!user?.id) return;

      try {
        // Assign new sort_order values based on position
        const updates = data.map((list, index) => ({
          id: list.id,
          sortOrder: (index + 1) * 1000, // Use increments of 1000
        }));

        await reorderLists({
          ownerId: user.id,
          lists: updates,
        });
      } catch (err) {
        console.error('Failed to reorder lists:', err);
      }
    },
    [user?.id, reorderLists]
  );

  const renderListItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Tables<'projects'>>) => (
      <ScaleDecorator>
        <ListTile
          list={item}
          onLongPress={drag}
          isActive={isActive}
          uncompletedCount={taskCounts[item.id] || 0}
        />
      </ScaleDecorator>
    ),
    [router, taskCounts]
  );

  return (
    <View className={'bg-background relative flex-1 px-6'}>
      <NewFab />

      <Button
        className={'absolute bottom-12 left-4 z-10'}
        size={'sm'}
        variant={'tertiary'}
        onPress={() => router.push('/lists/new')}>
        <Ionicons name={'add-circle-outline'} size={24} />
        <Button.Label>New List</Button.Label>
      </Button>

      <DraggableFlatList
        data={regularLists}
        keyExtractor={(item) => item.id}
        renderItem={renderListItem}
        onDragEnd={handleListDragEnd}
        showsVerticalScrollIndicator={false}
        autoscrollSpeed={150}
        autoscrollThreshold={80}
        ListHeaderComponent={() => (
          <View className={'pt-10'}>
            {/* Main Header Section */}
            <View className="mb-6">
              {mainHeaderList.map((item) => {
                const count =
                  item.title === 'Inbox'
                    ? viewCounts?.inbox
                    : item.title === 'Today'
                      ? viewCounts?.today
                      : item.title === 'Upcoming'
                        ? viewCounts?.upcoming
                        : undefined;

                return (
                  <TouchableOpacity
                    key={item.title}
                    className="mb-4 flex flex-row items-center gap-3"
                    onPress={() => {
                      if (item.to) {
                        router.push(item.to);
                      }
                    }}>
                    <View className="bg-surface h-11 w-11 items-center justify-center rounded-xl">
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <View className="flex-1">
                      <Text className={'text-base font-semibold'} numberOfLines={1}>
                        {item.title}
                      </Text>
                    </View>
                    {count !== undefined && count > 0 && (
                      <View className={'h-6 w-6 items-center justify-center rounded-md bg-gray-200'}>
                        <Text className={'text-muted text-sm font-medium'}>{count}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Favorites Section */}
            {favoriteLists.length > 0 && (
              <View className="mb-6">
                <View className={'mb-4'}>
                  <Text className="border-none text-base font-semibold">Favorites</Text>
                </View>
                {favoriteLists.map((list) => (
                  <ListTile key={list.id} list={list} uncompletedCount={taskCounts[list.id] || 0} />
                ))}
              </View>
            )}

            {/* Lists Section Header */}
            <View className={'mb-4'}>
              <Text className="border-none text-base font-semibold">Lists</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{
          paddingTop: 100,
          paddingBottom: 120,
        }}
        ListEmptyComponent={
          regularLists.length === 0 ? (
            <View className="py-8">
              {isLoading ? (
                <ActivityIndicator />
              ) : (
                <View className="border-border rounded-2xl border border-dashed p-6">
                  <Text className="text-muted-foreground text-center text-base">
                    {favoriteLists.length > 0
                      ? 'Create more lists to keep things organized.'
                      : 'Create your first list to keep things organized.'}
                  </Text>
                </View>
              )}
            </View>
          ) : null
        }
      />
    </View>
  );
}
