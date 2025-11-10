import { useCallback } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from 'react-native';

import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'heroui-native';
import { Stack, useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import NewFab from '@/components/new-fab';
import { ListTile } from '@/features/lists/components/list-tile';
import { useListsQuery } from '@/features/lists/queries/use-lists';
import type { Tables } from '@/supabase/database.types';
import { useAuthStore } from '@/store/auth-store';
import { ScreenScrollView } from '@/components/screen-scroll-view';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore((state) => ({
    user: state.user,
  }));
  const { data: lists = [], isLoading } = useListsQuery(user?.id ?? undefined);

  const handleListPress = useCallback(
    (listId: string) => {
      router.push({ pathname: '/lists/[id]', params: { id: listId } });
    },
    [router]
  );

  const renderListItem = useCallback<ListRenderItem<Tables<'projects'>>>(
    ({ item }) => <ListTile list={item} onPress={() => handleListPress(item.id)} />,
    [handleListPress]
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

      <ScreenScrollView>
        <View className={'h-5'} />

        <View className="gap-3">
          <TouchableOpacity className="flex flex-row items-center gap-4">
            <View className="bg-card flex items-center justify-center rounded-lg">
              <Ionicons name={'file-tray-outline'} size={22} />
            </View>
            <Text className={'text-base font-semibold'}>Inbox</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex flex-row items-center gap-4"
            onPress={() => router.push('/today')}>
            <View className="bg-card flex items-center justify-center rounded-lg">
              <Ionicons name={'today-outline'} size={22} />
            </View>
            <Text className={'text-base font-semibold'}>Today</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex flex-row items-center gap-4">
            <View className="bg-card flex items-center justify-center rounded-lg">
              <Ionicons name={'calendar-outline'} size={22} />
            </View>
            <Text className={'text-base font-semibold'}>Upcoming</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-6">
          <View className="mb-4 flex flex-row items-center gap-4">
            <Text className="text-muted-foreground mb-4 mt-6 border-none text-lg font-semibold">
              Favorites
            </Text>
          </View>

          <TouchableOpacity
            className="mb-2 flex flex-row items-center gap-4"
            onPress={() => router.push('/lists/1')}>
            <View className="bg-muted flex h-14 w-14 items-center justify-center rounded-lg">
              <Text>📥</Text>
            </View>
            <Text variant={'large'}>Project one</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-muted-foreground mb-4 mt-6 border-none text-lg font-semibold">
          Lists
        </Text>

        <FlashList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120,
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
      </ScreenScrollView>
    </View>
  );
}
