import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'heroui-native';
import { useMMKVString } from 'react-native-mmkv';

import BackButton from '@/components/ui/back-button';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/auth-store';
import { useListsQuery } from '@/features/lists/queries/use-lists';
import { TASK_LIST_STORAGE_KEY } from '@/features/tasks/constants';

export default function InboxPicker() {
  const router = useRouter();
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { data: lists = [], isLoading } = useListsQuery(user?.id ?? undefined);
  const [listMMKV, setListMMKV] = useMMKVString(TASK_LIST_STORAGE_KEY);

  const selectedListId = useMemo(() => listMMKV ?? null, [listMMKV]);
  const handleSelect = useCallback(
    (listId: string | null) => {
      if (!setListMMKV) {
        return;
      }

      if (listId) {
        setListMMKV(listId);
      } else {
        setListMMKV(undefined);
      }
      router.back();
    },
    [router, setListMMKV]
  );

  if (!user?.id) {
    return (
      <ScrollView className={'pb-safe flex-1'}>
        <View className={'flex flex-row items-center justify-between px-6 pr-4 pt-6'}>
          <BackButton isClose />
        </View>
        <Card className={'mx-6 mt-6 rounded-2xl'}>
          <Card.Body>
            <Text className={'text-base text-muted-foreground'}>
              Sign in to choose a list for your task.
            </Text>
          </Card.Body>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView className={'pb-safe flex-1'}>
      <View className={'flex flex-row items-center justify-between px-6 pr-4 pt-6'}>
        <BackButton isClose />
      </View>

      <View className={'px-6 pt-4'}>
        <Text className={'text-2xl font-semibold'}>Select a list</Text>
        <Text className={'mt-1 text-base text-muted-foreground'}>
          Choose where the task should live.
        </Text>
      </View>

      <View className={'px-6 pt-6'}>
        {isLoading ? (
          <ActivityIndicator />
        ) : lists.length === 0 ? (
          <Text className={'text-base text-muted-foreground'}>
            Create a list first to assign tasks.
          </Text>
        ) : (
          <View className={'gap-3'}>
            {lists.map((item) => {
              const isSelected = selectedListId === item.id;
              return (
                <Pressable
                  key={item.id}
                  className={
                    'flex flex-row items-center justify-between rounded-2xl border border-border bg-white px-4 py-3'
                  }
                  onPress={() => handleSelect(item.id)}>
                  <View className={'flex-1 pr-3'}>
                    <Text className={'text-lg font-semibold'} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className={'text-sm text-muted-foreground'} numberOfLines={2}>
                      No description
                    </Text>
                  </View>
                  {isSelected ? <Ionicons name="checkmark-circle" size={24} /> : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
