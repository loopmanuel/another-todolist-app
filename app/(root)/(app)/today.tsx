import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { useTodayTasksQuery } from '@/features/tasks/queries/use-today-tasks';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Accordion } from 'heroui-native';
import { TaskCard } from '@/features/tasks/components/task-card';
import { useMemo } from 'react';

export default function Today() {
  const router = useRouter();

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { data: tasks = [], isLoading } = useTodayTasksQuery({ createdBy: user?.id });

  // Group tasks by project
  const groupedTasks = useMemo(() => {
    const groups = new Map<
      string,
      { name: string; icon: string | null; color: string | null; tasks: typeof tasks }
    >();

    tasks.forEach((task) => {
      const projectId = task.project?.id || 'no-project';
      const projectName = task.project?.name || 'No List';
      const projectIcon = task.project?.icon || null;
      const projectColor = task.project?.color || null;

      if (!groups.has(projectId)) {
        groups.set(projectId, {
          name: projectName,
          icon: projectIcon,
          color: projectColor,
          tasks: [],
        });
      }
      groups.get(projectId)?.tasks.push(task);
    });

    return Array.from(groups.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      tasks: data.tasks,
    }));
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

  if (groupedTasks.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <View className="border-border rounded-2xl border border-dashed p-6">
          <Text className="text-muted-foreground text-center text-base">No tasks due today.</Text>
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
      showsVerticalScrollIndicator={false}>
      <Accordion selectionMode="multiple" defaultValue={groupedTasks.map((group) => group.id)}>
        {groupedTasks.map((group) => (
          <Accordion.Item key={group.id} value={group.id}>
            <Accordion.Trigger className="flex-row items-center justify-between py-3">
              <View className="flex-1 flex-row items-center gap-2">
                {group.icon && <Text className="text-lg">{group.icon}</Text>}
                <Text className="text-foreground text-base font-semibold">{group.name}</Text>
                <Text className="text-muted-foreground text-sm">({group.tasks.length})</Text>
              </View>
              <Accordion.Indicator />
            </Accordion.Trigger>
            <Accordion.Content>
              <View className="gap-3 pb-3">
                {group.tasks.map((task) => (
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
