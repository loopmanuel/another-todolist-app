import { useCallback, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Text } from '@/components/ui/text';
import { Button, useThemeColor } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useTasksQuery, type TaskWithSubtaskCounts } from '@/features/tasks/queries/use-tasks';
import { useAuthStore } from '@/store/auth-store';
import { TaskCard } from '@/features/tasks/components/task-card';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ListDetails() {
  const router = useRouter();

  const themeColorMuted = useThemeColor('accent-foreground');

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const projectId = useMemo(() => {
    if (!params.id) {
      return undefined;
    }
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params.id]);

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { data: tasks = [], isLoading } = useTasksQuery({ projectId, createdBy: user?.id });

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
        <View className="border-border mx-6 rounded-2xl border border-dashed p-6">
          <Text className="text-muted-foreground text-center text-base">
            {user?.id ? 'No tasks yet in this list.' : 'Sign in to view the tasks in this list.'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className={'pb-safe flex-1'}>
      <Button
        onPress={() =>
          router.push({
            pathname: '/lists/edit',
            params: { list_id: params.id },
          })
        }>
        <Button.Label>Edit</Button.Label>
      </Button>

      <ThemeToggle />

      <FlashList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 96, paddingHorizontal: 24 }}
      />

      <View className={'pb-safe left-0 right-0 px-6 pt-2'}>
        <Button
          variant={'primary'}
          className={'mb-6'}
          onPress={() => {
            if (projectId) {
              router.push({ pathname: '/task/new', params: { list_id: projectId } });
            } else {
              router.push('/task/new');
            }
          }}>
          <Ionicons name={'add-circle-outline'} size={24} color={themeColorMuted} />
          <Button.Label>Add Todo</Button.Label>
        </Button>
      </View>
    </View>
  );
}
