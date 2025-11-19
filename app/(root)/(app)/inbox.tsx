import { useCallback, useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import { TaskCard } from '@/features/tasks/components/task-card';
import {
  useInboxTasksQuery,
  type InboxTaskWithDetails,
} from '@/features/tasks/queries/use-inbox-tasks';
import { useAuthStore } from '@/store/auth-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Accordion } from 'heroui-native';

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

    const futureTasks = tasks.filter((task) => {
      if (!task.due_at) return false;
      const dueDate = new Date(task.due_at);
      return dueDate > endOfToday;
    });

    const unscheduled = tasks.filter((task) => !task.due_at);

    return [
      {
        id: 'overdue',
        title: 'Overdue',
        data: overdue,
        titleColor: '#ef4444', // red
      },
      {
        id: 'today',
        title: 'Today',
        data: todayTasks,
        titleColor: '#3b82f6', // blue
      },
      {
        id: 'future',
        title: 'Upcoming',
        data: futureTasks,
        titleColor: '#10b981', // green
      },
      {
        id: 'unscheduled',
        title: 'Unscheduled',
        data: unscheduled,
        titleColor: '#6b7280', // gray
      },
    ].filter((section) => section.data.length > 0); // Only show non-empty sections
  }, [tasks]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

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
    <ScrollView
      className="flex-1"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />}>
      <Accordion selectionMode="multiple" defaultValue={sections.map((section) => section.id)}>
        {sections.map((section) => (
          <Accordion.Item key={section.id} value={section.id}>
            <Accordion.Trigger className="flex-row items-center justify-between py-3">
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
              <Accordion.Indicator />
            </Accordion.Trigger>
            <Accordion.Content>
              <View className="gap-3 pb-3">
                {section.data.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={(task) => router.push(`/task/${task.id}`)}
                  />
                ))}
              </View>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </ScrollView>
  );
}
