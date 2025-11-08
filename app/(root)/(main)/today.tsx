import { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Text } from '@/components/ui/text';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTodayTasksQuery, type TaskWithSubtaskCounts } from '@/features/tasks/queries/use-today-tasks';
import { useAuthStore } from '@/store/auth-store';
import { TaskCard } from '@/features/tasks/components/task-card';

export default function TodayScreen() {
  const router = useRouter();

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const {
    data: tasks = [],
    isLoading,
    isRefetching,
    refetch,
  } = useTodayTasksQuery({ createdBy: user?.id });

  const renderTaskItem = useCallback<ListRenderItem<TaskWithSubtaskCounts>>(
    ({ item }) => {
      return (
        <View className={'mb-3'}>
          <TaskCard task={item} onPress={(task) => router.push(`/task/${task.id}`)} />
        </View>
      );
    },
    [router]
  );

  const listEmpty = (
    <View className="py-10">
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View className="mx-6 rounded-2xl border border-dashed border-border p-6">
          <Text className="text-center text-base text-muted-foreground">
            {user?.id ? 'No tasks due today.' : 'Sign in to view your tasks.'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className={'pb-safe flex-1'}>
      <FlashList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 96, paddingHorizontal: 24 }}
      />

      <View className={'pb-safe absolute bottom-0 left-0 right-0 px-6 pt-2'}>
        <Button
          variant={'secondary'}
          onPress={() => {
            router.push('/task/new');
          }}>
          <Ionicons name={'add-circle-outline'} size={24} />
          <Button.Label>Add Todo</Button.Label>
        </Button>
      </View>
    </View>
  );
}
