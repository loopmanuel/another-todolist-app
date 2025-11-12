import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { Text } from '@/components/ui/text';
import { Button, Dialog, Popover, useThemeColor } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { useTasksQuery, type TaskWithSubtaskCounts } from '@/features/tasks/queries/use-tasks';
import { useListQuery } from '@/features/lists/queries/use-list';
import { useToggleHideCompletedMutation } from '@/features/lists/mutations/use-toggle-hide-completed';
import { useDeleteListMutation } from '@/features/lists/mutations/use-delete-list';
import { useReorderTasksMutation } from '@/features/tasks/mutations/use-reorder-tasks';
import { useAuthStore } from '@/store/auth-store';
import { TaskCard } from '@/features/tasks/components/task-card';
import { LargeTitleLayout } from '@/components/large-title-layout';
import { StyledIcon } from '@/components/styled-icon';

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

      setIsDeleteDialogOpen(false);
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
    <View className={'relative flex-1'}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Popover>
              <Popover.Trigger asChild>
                <Pressable className={'px-2.5'}>
                  <StyledIcon name={'ellipsis-vertical-outline'} size={20} />
                </Pressable>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Overlay />
                <Popover.Content width={320} placement="top" className="gap-3 px-6 py-5">
                  <Popover.Close className="absolute right-4 top-4 z-50" />

                  <Button
                    onPress={() =>
                      router.push({
                        pathname: '/lists/edit',
                        params: { list_id: params.id },
                      })
                    }>
                    <Button.Label>Edit</Button.Label>
                  </Button>

                  <Button
                    onPress={() => void handleToggleHideCompleted()}
                    isDisabled={isToggling || !list}>
                    <Button.Label>
                      {list?.hide_completed_tasks ? 'Show Completed Tasks' : 'Hide Completed Tasks'}
                    </Button.Label>
                  </Button>

                  <Button variant={'destructive'} onPress={() => setIsDeleteDialogOpen(true)}>
                    <Button.Label>Delete List</Button.Label>
                  </Button>
                </Popover.Content>
              </Popover.Portal>
            </Popover>
          ),
        }}
      />

      <Dialog isOpen={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Close className="-mb-2 self-end" />
            <View className="mb-5 gap-1.5">
              <Dialog.Title>Delete List</Dialog.Title>
              <Dialog.Description>
                Are you sure you want to delete this list? All tasks in this list will also be
                deleted. This action cannot be undone.
              </Dialog.Description>
            </View>
            <View className="flex-row justify-end gap-3">
              <Dialog.Close asChild>
                <Button variant="ghost" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button size="sm" onPress={() => void handleDeleteList()} isDisabled={isDeletingList}>
                <Button.Label>{isDeletingList ? 'Deleting...' : 'Delete'}</Button.Label>
              </Button>
            </View>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <View className={'absolute bottom-0 left-0 right-0 z-10 px-6'}>
        <Button
          variant={'tertiary'}
          className={'mb-6'}
          onPress={() => {
            if (projectId) {
              router.push({ pathname: '/task/new', params: { list_id: projectId } });
            } else {
              router.push('/task/new');
            }
          }}>
          <Ionicons name={'add-circle-outline'} size={24} />
          <Button.Label>Add Todo</Button.Label>
        </Button>
      </View>

      <LargeTitleLayout title={'List Details'}>
        {({ setScrollY, onScroll, ListHeaderSpacer, contentContainerStyle }) => (
          <>
            <DraggableFlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={renderTaskItem}
              onDragEnd={handleDragEnd}
              ListEmptyComponent={listEmpty}
              ListHeaderComponent={() => (
                <>
                  <ListHeaderSpacer />
                </>
              )}
              contentContainerStyle={contentContainerStyle}
              scrollEventThrottle={16}
              onScrollOffsetChange={(y) => setScrollY(y)}
            />
          </>
        )}
      </LargeTitleLayout>
    </View>
  );
}
