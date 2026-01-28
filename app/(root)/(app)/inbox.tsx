import { useCallback, useMemo } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import { TaskCard } from '@/features/tasks/components/task-card';
import {
  useInboxTasksQuery,
  type InboxTaskWithDetails,
} from '@/features/tasks/queries/use-inbox-tasks';
import { useAuthStore } from '@/store/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AgendaList, CalendarProvider } from 'react-native-calendars';

type InboxSection = {
  id: string;
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

  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }, []);

  // Group tasks into Overdue and Today sections
  const sections = useMemo<InboxSection[]>(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
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
      if (!task.due_at) return true;
      const dueDate = new Date(task.due_at);
      return dueDate >= startOfToday && dueDate <= endOfToday;
    });

    return [
      {
        id: 'overdue',
        title: 'Overdue',
        data: overdue,
        titleColor: '#ef4444',
      },
      {
        id: 'today',
        title: 'Today',
        data: todayTasks,
        titleColor: '#3b82f6',
      },
    ].filter((section) => section.data.length > 0);
  }, [tasks]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: InboxTaskWithDetails }) => (
      <View className="mb-3">
        <TaskCard task={item} onPress={(task) => router.push(`/task/${task.id}`)} />
      </View>
    ),
    [router]
  );

  const renderSectionHeader = useCallback((info: { section?: unknown }) => {
    const section = info.section as InboxSection | undefined;

    if (!section) {
      return null;
    }

    return (
      <View className="flex-row items-center justify-between py-3">
        <View className="flex-1 flex-row items-center gap-2">
          <Text className="text-base font-semibold" style={{ color: section.titleColor }}>
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
      </View>
    );
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!user?.id) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="border-border rounded-2xl border border-dashed p-6">
          <Text className="text-muted-foreground text-center text-base">
            Sign in to view your inbox.
          </Text>
        </View>
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="border-border rounded-2xl border border-dashed p-6">
          <Text className="text-muted-foreground text-center text-base">
            All clear! No tasks in your inbox.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CalendarProvider date={today} showTodayButton={true}>
        <AgendaList
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 24 + insets.bottom,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}
        />
      </CalendarProvider>
    </View>
  );
}
