import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useTodayTasksQuery } from '@/features/tasks/queries/use-today-tasks';
import { ActivityIndicator, SectionList, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { TaskCard } from '@/features/tasks/components/task-card';
import { useMemo } from 'react';
import dayjs from 'dayjs';

export default function Today() {
  const router = useRouter();

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { data: tasks = [], isLoading } = useTodayTasksQuery({ createdBy: user?.id });

  const sections = useMemo(() => {
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
      if (!task.due_at) return false;
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
        title: dayjs(startOfToday).format('MMM D, YYYY'),
        data: todayTasks,
        titleColor: '#3b82f6',
      },
    ].filter((section) => section.data.length > 0);
  }, [tasks]);

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
            Sign in to view your tasks.
          </Text>
        </View>
      </View>
    );
  }

  if (sections.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="border-border rounded-2xl border border-dashed p-6">
          <Text className="text-muted-foreground text-center text-base">No tasks due today.</Text>
        </View>
      </View>
    );
  }

  return (
    <SectionList
      className="flex-1"
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={({ section }) => (
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center gap-2">
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
      )}
      renderItem={({ item }) => (
        <View className="mb-3">
          <TaskCard
            task={item}
            onPress={(task) => router.push(`/task/${task.id}`)}
            showProject
            projectInfo={
              item.project
                ? {
                    name: item.project.name,
                    color: item.project.color,
                    icon: item.project.icon,
                  }
                : undefined
            }
          />
        </View>
      )}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
      }}
      showsVerticalScrollIndicator={false}
    />
  );
}
