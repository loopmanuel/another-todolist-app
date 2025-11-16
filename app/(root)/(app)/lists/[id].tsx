import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Text } from '@/components/ui/text';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { useTasksQuery, type TaskWithSubtaskCounts } from '@/features/tasks/queries/use-tasks';
import { useListQuery } from '@/features/lists/queries/use-list';
import { useToggleHideCompletedMutation } from '@/features/lists/mutations/use-toggle-hide-completed';
import { useDeleteListMutation } from '@/features/lists/mutations/use-delete-list';
import { useReorderTasksMutation } from '@/features/tasks/mutations/use-reorder-tasks';
import { useAuthStore } from '@/store/auth-store';
import { TaskCard } from '@/features/tasks/components/task-card';
import * as DropdownMenu from 'zeego/dropdown-menu';

export default function ListDetails() {
  const router = useRouter();

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const projectId = useMemo(() => {
    if (!params.id) {
      return undefined;
    }
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params.id]);

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { data: list } = useListQuery(projectId);
  const { data: tasks = [], isLoading } = useTasksQuery({
    projectId,
    createdBy: user?.id,
    hideCompleted: list?.hide_completed_tasks ?? false,
  });
  const { mutateAsync: toggleHideCompleted, isPending: isToggling } =
    useToggleHideCompletedMutation();
  const { mutateAsync: deleteList, isPending: isDeletingList } = useDeleteListMutation();
  const { mutateAsync: reorderTasks } = useReorderTasksMutation();

  const handleToggleHideCompleted = useCallback(async () => {
    if (!projectId || !user?.id || !list) return;

    try {
      await toggleHideCompleted({
        listId: projectId,
        ownerId: user.id,
        hideCompleted: !list.hide_completed_tasks,
      });
    } catch (err) {
      console.error('Failed to toggle hide completed:', err);
    }
  }, [projectId, user?.id, list, toggleHideCompleted]);

  const handleDeleteList = useCallback(async () => {
    if (!projectId || !user?.id) return;

    try {
      await deleteList({
        listId: projectId,
        ownerId: user.id,
      });

      router.back();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to delete list.';
      Alert.alert('Delete failed', message);
    }
  }, [projectId, user?.id, deleteList, router]);

  const handleDragEnd = useCallback(
    async ({ data }: { data: TaskWithSubtaskCounts[] }) => {
      if (!projectId) return;

      try {
        // Assign new sort_order values based on position
        const updates = data.map((task, index) => ({
          id: task.id,
          sortOrder: (index + 1) * 1000, // Use increments of 1000
        }));

        await reorderTasks({
          projectId,
          tasks: updates,
        });
      } catch (err) {
        console.error('Failed to reorder tasks:', err);
      }
    },
    [projectId, reorderTasks]
  );

  const renderTaskItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<TaskWithSubtaskCounts>) => {
      return (
        <ScaleDecorator>
          <View className={'mb-3'}>
            <TaskCard
              task={item}
              onPress={(task) => router.push(`/task/${task.id}`)}
              onLongPress={drag}
              isActive={isActive}
            />
          </View>
        </ScaleDecorator>
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
    <View className={'flex-1'}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View className={'w-10 overflow-hidden border border-green-500'}>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Pressable
                    className={
                      'mr-2 h-9 w-9 items-center justify-center rounded-full border border-red-500'
                    }>
                    <Ionicons name={'ellipsis-vertical-outline'} size={20} />
                  </Pressable>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Label />
                  <DropdownMenu.Item
                    key={'edit-item'}
                    onSelect={() => {
                      if (projectId) {
                        router.push({
                          pathname: '/lists/edit',
                          params: { list_id: projectId },
                        });
                      }
                    }}>
                    <DropdownMenu.ItemTitle>Edit List</DropdownMenu.ItemTitle>
                  </DropdownMenu.Item>
                  <DropdownMenu.CheckboxItem
                    key={'show-completed'}
                    value={list?.hide_completed_tasks ? 'off' : 'on'}
                    onValueChange={() => {
                      void handleToggleHideCompleted();
                    }}>
                    <DropdownMenu.ItemIndicator />
                    <DropdownMenu.ItemTitle>Show Completed Tasks</DropdownMenu.ItemTitle>
                  </DropdownMenu.CheckboxItem>
                  <DropdownMenu.Separator />

                  <DropdownMenu.Group>
                    <DropdownMenu.Item
                      key={'delete-item'}
                      destructive
                      onSelect={() => {
                        Alert.alert(
                          'Delete List',
                          `Are you sure you want to delete "${list?.name}"? This action cannot be undone.`,
                          [
                            {
                              text: 'Cancel',
                              style: 'cancel',
                            },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => {
                                void handleDeleteList();
                              },
                            },
                          ]
                        );
                      }}>
                      <DropdownMenu.ItemTitle>Delete list</DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                  <DropdownMenu.Arrow />
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </View>
          ),
        }}
      />

      <DraggableFlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        onDragEnd={handleDragEnd}
        ListEmptyComponent={listEmpty}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 120,
          paddingBottom: 120,
          paddingHorizontal: 16,
        }}
      />
      <View className={'absolute bottom-10 w-full px-4'}>
        <Button
          variant={'secondary'}
          onPress={() => {
            if (projectId) {
              router.push({
                pathname: '/task/new',
                params: { list_id: projectId },
              });
            }
          }}>
          <Button.Label>Add Task</Button.Label>
        </Button>
      </View>
    </View>
  );
}
