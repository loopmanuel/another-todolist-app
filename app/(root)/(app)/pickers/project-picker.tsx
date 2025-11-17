import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from 'heroui-native';

import BackButton from '@/components/ui/back-button';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/auth-store';
import { useListsQuery } from '@/features/lists/queries/use-lists';
import { useUpdateTaskMutation } from '@/features/tasks/mutations/use-update-task';

export default function ProjectPicker() {
  const router = useRouter();
  const params = useLocalSearchParams<{ currentProjectId?: string; taskId?: string }>();
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { data: lists = [], isLoading } = useListsQuery(user?.id ?? undefined);
  const { mutateAsync: updateTask, isPending: isUpdating } = useUpdateTaskMutation();

  const currentProjectId = useMemo(
    () => (Array.isArray(params.currentProjectId) ? params.currentProjectId[0] : params.currentProjectId),
    [params.currentProjectId]
  );

  const taskId = useMemo(
    () => (Array.isArray(params.taskId) ? params.taskId[0] : params.taskId),
    [params.taskId]
  );

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const hasChanges = selectedProjectId && selectedProjectId !== currentProjectId;

  const handleSelect = useCallback(
    (projectId: string) => {
      if (projectId === currentProjectId) {
        return;
      }
      setSelectedProjectId(projectId);
    },
    [currentProjectId]
  );

  const handleConfirm = useCallback(async () => {
    if (!selectedProjectId || !taskId || !currentProjectId) {
      return;
    }

    try {
      await updateTask({
        taskId,
        projectId: currentProjectId,
        payload: {
          project_id: selectedProjectId,
        },
      });

      // Dismiss the modal and return to task detail
      router.dismiss();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to move task.';
      Alert.alert('Move failed', message);
    }
  }, [selectedProjectId, taskId, currentProjectId, updateTask, router]);

  if (!user?.id) {
    return (
      <ScrollView className={'pb-safe flex-1'}>
        <View className={'flex flex-row items-center justify-between px-6 pr-4 pt-6'}>
          <BackButton isClose />
        </View>
        <Card className={'mx-6 mt-6 rounded-2xl'}>
          <Card.Body>
            <Text className={'text-muted-foreground text-base'}>
              Sign in to move this task to a different project.
            </Text>
          </Card.Body>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView className={'pb-safe flex-1'}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable className={'px-1 py-1'} onPress={() => router.dismiss()}>
              <Ionicons name={'chevron-back-outline'} size={24} />
            </Pressable>
          ),
          headerRight: hasChanges
            ? () => (
                <Button
                  className={'rounded-full'}
                  isIconOnly
                  onPress={() => void handleConfirm()}
                  isDisabled={isUpdating}>
                  <Button.Label>
                    {isUpdating ? (
                      <ActivityIndicator size={'small'} />
                    ) : (
                      <Ionicons name={'checkmark-outline'} size={22} />
                    )}
                  </Button.Label>
                </Button>
              )
            : undefined,
        }}
      />

      <View className={'px-6 pt-4'}>
        <Text className={'text-2xl font-semibold'}>Move to project</Text>
        <Text className={'text-muted-foreground mt-1 text-base'}>
          Choose which project this task belongs to.
        </Text>
      </View>

      <View className={'px-6 pt-6'}>
        {isLoading ? (
          <ActivityIndicator />
        ) : lists.length === 0 ? (
          <Text className={'text-muted-foreground text-base'}>
            Create a project first to move tasks.
          </Text>
        ) : (
          <View className={'gap-3'}>
            {lists.map((item) => {
              const isCurrent = currentProjectId === item.id;
              const isSelected = selectedProjectId === item.id;
              return (
                <Pressable
                  key={item.id}
                  className={
                    'border-border flex flex-row items-center justify-between rounded-2xl border bg-white px-4 py-3'
                  }
                  onPress={() => handleSelect(item.id)}>
                  <View className={'flex-1 pr-3'}>
                    <Text className={'text-lg font-semibold'} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                  {isCurrent && !isSelected ? (
                    <View className={'flex-row items-center gap-2'}>
                      <Text className={'text-muted-foreground text-sm'}>Current</Text>
                    </View>
                  ) : isSelected ? (
                    <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
