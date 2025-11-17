import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useTodayTasksQuery } from '@/features/tasks/queries/use-today-tasks';
import { ActivityIndicator, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { AnimatedLegendList } from '@legendapp/list/reanimated';
import { TaskCard } from '@/features/tasks/components/task-card';

export default function Today() {
  const router = useRouter();

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { data: tasks = [], isLoading } = useTodayTasksQuery({ createdBy: user?.id });

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
    <View className={'flex-1'}>
      <AnimatedLegendList
        contentInsetAdjustmentBehavior={'automatic'}
        data={tasks}
        renderItem={({ item }) => (
          <View className="mb-3">
            <TaskCard task={item} onPress={(task) => router.push(`/task/${task.id}`)} />
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => <View className={'h-8'} />}
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        ListEmptyComponent={listEmpty}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      />
    </View>
  );
}
