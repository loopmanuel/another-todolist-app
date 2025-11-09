import { ActivityIndicator, View } from 'react-native';

import { FlashList } from '@shopify/flash-list';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';

import { useTodayTasksQuery } from '@/features/tasks/queries/use-today-tasks';
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

  const listEmpty = (
    <View className="py-10">
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View className="border-border mx-6 rounded-2xl border border-dashed p-6">
          <Text className="text-muted-foreground text-center text-base">
            {user?.id ? 'No tasks due today.' : 'Sign in to view your tasks.'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className={'flex-1 pt-6'}>
      <FlashList
        data={tasks}
        renderItem={({ item }) => (
          <View className={'mb-3'}>
            <TaskCard task={item} onPress={(task) => router.push(`/task/${task.id}`)} />
          </View>
        )}
        refreshing={isRefetching}
        onRefresh={refetch}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={listEmpty}
        contentInsetAdjustmentBehavior="scrollableAxes"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 96,
        }}
      />
    </View>
  );
}
