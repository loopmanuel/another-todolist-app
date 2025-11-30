import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, View } from 'react-native';

import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Text } from '@/components/ui/text';
import { Button, Popover } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { useTasksQuery, type TaskWithSubtaskCounts } from '@/features/tasks/queries/use-tasks';
import { useListQuery } from '@/features/lists/queries/use-list';
import { useToggleHideCompletedMutation } from '@/features/lists/mutations/use-toggle-hide-completed';
import { useToggleFavoriteMutation } from '@/features/lists/mutations/use-toggle-favorite';
import { useDeleteListMutation } from '@/features/lists/mutations/use-delete-list';
import { useReorderTasksMutation } from '@/features/tasks/mutations/use-reorder-tasks';
import { useAuthStore } from '@/store/auth-store';
import { TaskCard } from '@/features/tasks/components/task-card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ListDetails() {
  const router = useRouter();

  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const projectId = useMemo(() => {
    if (!params.id) {
      return undefined;
    }
    return Array.isArray(params.id) ? params.id[0] : params.id;
  }, [params.id]);

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const {
    data: list,
    isRefetching: isRefetchingList,
    refetch: refetchList,
  } = useListQuery(projectId);
  const {
    data: tasks = [],
    isLoading,
    isRefetching: isRefetchingTasks,
    refetch: refetchTasks,
  } = useTasksQuery({
    projectId,
    createdBy: user?.id,
    hideCompleted: list?.hide_completed_tasks ?? false,
  });
  const { mutateAsync: toggleHideCompleted, isPending: isToggling } =
    useToggleHideCompletedMutation();
  const { mutateAsync: toggleFavorite } = useToggleFavoriteMutation();
  const { mutateAsync: deleteList, isPending: isDeletingList } = useDeleteListMutation();
  const { mutateAsync: reorderTasks } = useReorderTasksMutation();

  const [open, setOpen] = useState(false);

  const isRefreshing = isRefetchingList || isRefetchingTasks;
  const handleRefresh = useCallback(async () => {
    // Stagger refresh operations for smoother transitions
    await refetchList();
    await refetchTasks();
  }, [refetchList, refetchTasks]);

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

  const handleToggleFavorite = useCallback(async () => {
    if (!projectId || !user?.id || !list) return;

    try {
      await toggleFavorite({
        listId: projectId,
        ownerId: user.id,
        isFavorite: !list.is_favorite,
      });
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }, [projectId, user?.id, list, toggleFavorite]);

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
              shouldAnimateOnComplete={list?.hide_completed_tasks ?? true}
            />
          </View>
        </ScaleDecorator>
      );
    },
    [router, list?.hide_completed_tasks]
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
    <>
      <Stack.Screen
        options={{
          title: list?.name ?? '',
          headerRight: () => (
            <View className="flex-row items-center gap-2">
              <Pressable
                className="h-9 w-9 items-center justify-center rounded-full"
                onPress={() => {
                  void handleToggleFavorite();
                }}>
                <Ionicons
                  name={list?.is_favorite ? 'star' : 'star-outline'}
                  size={22}
                  className="text-warning"
                />
              </Pressable>
              <Popover>
                <Popover.Trigger asChild>
                  <Pressable className="h-9 w-9 items-center justify-center rounded-full">
                    <Ionicons name="ellipsis-vertical-outline" size={20} />
                  </Pressable>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Overlay className="bg-black/15" />
                  <Popover.Content presentation="bottom-sheet" detached>
                    <View className="gap-4">
                      <View className="gap-2">
                        <Pressable
                          className="flex-row items-center gap-3 rounded-lg p-3"
                          onPress={() => {
                            setOpen(false);
                            if (projectId) {
                              router.push({
                                pathname: '/lists/edit',
                                params: { list_id: projectId },
                              });
                            }
                          }}>
                          <View className="bg-accent/10 size-10 items-center justify-center rounded-full">
                            <Ionicons name="pencil-outline" size={20} className="text-accent" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-foreground text-base font-medium">Edit List</Text>
                          </View>
                        </Pressable>

                        <Pressable
                          className="flex-row items-center gap-3 rounded-lg p-3"
                          onPress={() => {
                            void handleToggleHideCompleted();
                          }}>
                          <View className="bg-primary/10 size-10 items-center justify-center rounded-full">
                            <Ionicons
                              name={list?.hide_completed_tasks ? 'eye-outline' : 'eye-off-outline'}
                              size={20}
                              className="text-primary"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-foreground text-base font-medium">
                              {list?.hide_completed_tasks ? 'Show' : 'Hide'} Completed Tasks
                            </Text>
                          </View>
                          {!list?.hide_completed_tasks && (
                            <Ionicons name="checkmark" size={20} className="text-success" />
                          )}
                        </Pressable>

                        <Pressable
                          className="flex-row items-center gap-3 rounded-lg p-3"
                          onPress={() => {
                            void handleToggleFavorite();
                          }}>
                          <View className="bg-warning/10 size-10 items-center justify-center rounded-full">
                            <Ionicons
                              name={list?.is_favorite ? 'star' : 'star-outline'}
                              size={20}
                              className="text-warning"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-foreground text-base font-medium">
                              {list?.is_favorite ? 'Remove from' : 'Add to'} Favorites
                            </Text>
                          </View>
                          {list?.is_favorite && (
                            <Ionicons name="checkmark" size={20} className="text-success" />
                          )}
                        </Pressable>

                        <View className="my-2 border-t border-gray-200" />

                        <Pressable
                          className="bg-destructive/5 flex-row items-center gap-3 rounded-lg p-3"
                          onPress={() => {
                            setOpen(false);
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
                          <View className="bg-danger/10 size-10 items-center justify-center rounded-full">
                            <Ionicons name="trash-outline" size={20} className="text-destructive" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-danger font-medium text-red-600">
                              Delete List
                            </Text>
                          </View>
                        </Pressable>
                      </View>
                    </View>
                  </Popover.Content>
                </Popover.Portal>
              </Popover>
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
        contentInsetAdjustmentBehavior="automatic"
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        ListFooterComponent={<View style={{ height: 50 }} />}
        contentContainerStyle={{
          paddingTop: 50,
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
    </>
  );
}
