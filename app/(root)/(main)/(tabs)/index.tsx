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

export default function Home() {
  const router = useRouter();
  const { signOut, user } = useAuthStore((state) => ({
    signOut: state.signOut,
    user: state.user,
  }));
  const {
    data: lists = [],
    isLoading,
    isRefetching,
    refetch,
  } = useListsQuery(user?.id ?? undefined);

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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Sign out failed', error);
    }
  };

  return (
    <View className={'relative flex-1'}>
      <NewFab />

      <ScrollView className={'flex flex-1 bg-white'}>
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
              <View className={'flex flex-row items-center gap-2 pr-4'}>
                <Button variant={'tertiary'} isIconOnly className={'rounded-full'}>
                  <Button.Label>
                    <Ionicons name={'search-outline'} size={20} />
                  </Button.Label>
                </Button>
                <Button
                  variant={'tertiary'}
                  isIconOnly
                  className={'rounded-full'}
                  onPress={handleSignOut}>
                  <Button.Label>
                    <Ionicons name={'log-out-outline'} size={20} />
                  </Button.Label>
                </Button>
              </View>
            ),
            headerShadowVisible: false,
          }}
        />

        <View className="pt-safe px-4">
          <View className="gap-3">
            <TouchableOpacity className="flex flex-row items-center gap-4">
              <View className="flex h-12 w-14 items-center justify-center rounded-lg bg-white">
                <Ionicons name={'file-tray-outline'} size={22} />
              </View>
              <Text variant={'large'}>Inbox</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex flex-row items-center gap-4">
              <View className="flex h-12 w-14 items-center justify-center rounded-lg bg-white">
                <Ionicons name={'today-outline'} size={22} />
              </View>
              <Text variant={'large'}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex flex-row items-center gap-4">
              <View className="flex h-12 w-14 items-center justify-center rounded-lg bg-white">
                <Ionicons name={'calendar-outline'} size={22} />
              </View>
              <Text variant={'large'}>Upcoming</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-6">
            <View className="mb-4 flex flex-row items-center gap-4">
              <Text className="border-none text-xl font-semibold text-gray-600">Favorites</Text>
            </View>

            <TouchableOpacity
              className="mb-2 flex flex-row items-center gap-4"
              onPress={() => router.push('/lists/1')}>
              <View className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-200">
                <Text>📥</Text>
              </View>
              <Text variant={'large'}>Project one</Text>
            </TouchableOpacity>
          </View>

          <Text variant="h3" className="mb-4 mt-6 border-none text-xl font-semibold text-gray-600">
            Lists
          </Text>
        </View>

        <FlashList
          data={lists}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          refreshing={isRefetching}
          onRefresh={() => refetch()}
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
                  <View className="rounded-2xl border border-dashed border-border p-6">
                    <Text className="text-center text-base text-muted-foreground">
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
      </ScrollView>
    </View>
  );
}
