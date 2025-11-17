import { useCallback, useMemo } from 'react';
import { ActivityIndicator, RefreshControl, SectionList, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import { TaskCard } from '@/features/tasks/components/task-card';
import {
  useInboxTasksQuery,
  type InboxTaskWithDetails,
} from '@/features/tasks/queries/use-inbox-tasks';
import { useAuthStore } from '@/store/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type InboxSection = {
  title: string;
  data: InboxTaskWithDetails[];
  titleColor: string;
};

export default function Inbox() {
  const router = useRouter();
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const {
    data: tasks = [],
    isLoading,
    isRefetching,
    refetch,
  } = useInboxTasksQuery({
    createdBy: user?.id,
  });

  const insets = useSafeAreaInsets();

  // Group tasks into sections
  const sections = useMemo<InboxSection[]>(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    const overdue = tasks.filter((task) => {
      if (!task.due_at) return false;
      return new Date(task.due_at) < startOfToday;
    });

    const todayTasks = tasks.filter((task) => {
      if (!task.due_at) return false;
      const dueDate = new Date(task.due_at);
      return dueDate >= startOfToday && dueDate <= endOfToday;
    });

    const unscheduled = tasks.filter((task) => !task.due_at);

    return [
      {
        title: 'Overdue',
        data: overdue,
        titleColor: '#ef4444', // red
      },
      {
        title: 'Today',
        data: todayTasks,
        titleColor: '#3b82f6', // blue
      },
      {
        title: 'Unscheduled',
        data: unscheduled,
        titleColor: '#6b7280', // gray
      },
    ].filter((section) => section.data.length > 0); // Only show non-empty sections
  }, [tasks]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: InboxSection }) => (
      <View className="bg-background mb-3 flex-row items-center gap-2 pb-2 pt-4">
        <Text className="text-lg font-semibold" style={{ color: section.titleColor }}>
          {section.title}
        </Text>
        <View
          className="h-6 min-w-[24px] items-center justify-center rounded-full px-2"
          style={{ backgroundColor: section.titleColor + '20' }}>
          <Text className="text-sm font-medium" style={{ color: section.titleColor }}>
            {section.data.length}
          </Text>
        </View>
      </View>
    ),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: InboxTaskWithDetails }) => (
      <View className="mb-3">
        <TaskCard task={item} onPress={(task) => router.push(`/task/${task.id}`)} />
      </View>
    ),
    [router]
  );

  const listEmpty = (
    <View className="py-10">
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View className="border-border mx-6 rounded-2xl border border-dashed p-6">
          <Text className="text-muted-foreground text-center text-base">
            {user?.id
              ? 'All clear! No overdue, today, or unscheduled tasks.'
              : 'Sign in to view your inbox.'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1">
      <SectionList
        contentInsetAdjustmentBehavior={'automatic'}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={listEmpty}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}
