import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, TextInput, View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Text } from '@/components/ui/text';
import BackButton from '@/components/ui/back-button';
import { Button, Checkbox } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import type { Tables } from '@/supabase/database.types';
import { useLabelsQuery } from '@/features/labels/queries/use-labels';
import { useCreateLabelMutation } from '@/features/labels/mutations/use-create-label';
import { useAuthStore } from '@/store/auth-store';
import { useTaskFormStore } from '@/store/task-form-store';
import { useTaskLabelsQuery } from '@/features/tasks/queries/use-task-labels';
import { useUpdateTaskLabelsMutation } from '@/features/tasks/mutations/use-update-task-labels';
import { useTaskQuery } from '@/features/tasks/queries/use-task';

type LabelRow = Tables<'labels'>;

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
];

function getRandomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export default function PickLabel() {
  const router = useRouter();
  const params = useLocalSearchParams<{ taskId?: string }>();
  const taskId = params.taskId;

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { selectedLabels: storeSelectedLabels, setSelectedLabels: setStoreSelectedLabels } =
    useTaskFormStore();

  // Fetch task data if editing an existing task
  const { data: task } = useTaskQuery({ taskId, createdBy: user?.id });
  const { data: taskLabels = [], isLoading: taskLabelsLoading } = useTaskLabelsQuery({ taskId });
  const { mutateAsync: updateTaskLabels } = useUpdateTaskLabelsMutation();

  const {
    data: labels = [],
    isLoading,
    isRefetching,
    refetch,
  } = useLabelsQuery({ userId: user?.id });
  const { mutateAsync: createLabel, isPending: isCreating } = useCreateLabelMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<Set<string>>(
    taskId ? new Set() : storeSelectedLabels
  );

  // Initialize selected labels from task when editing
  useEffect(() => {
    if (taskId && !taskLabelsLoading && taskLabels.length > 0) {
      setSelectedLabels(new Set(taskLabels.map((label) => label.id)));
    }
  }, [taskId, taskLabels, taskLabelsLoading]);

  // Filter labels based on search query
  const filteredLabels = useMemo(() => {
    if (!searchQuery.trim()) {
      return labels;
    }
    const query = searchQuery.toLowerCase();
    return labels.filter((label) => label.name.toLowerCase().includes(query));
  }, [labels, searchQuery]);

  // Check if search query exactly matches an existing label
  const exactMatch = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return labels.find((label) => label.name.toLowerCase() === searchQuery.toLowerCase());
  }, [labels, searchQuery]);

  const handleToggleLabel = useCallback(
    async (labelId: string) => {
      setSelectedLabels((prev) => {
        const next = new Set(prev);
        if (next.has(labelId)) {
          next.delete(labelId);
        } else {
          next.add(labelId);
        }

        // If editing an existing task, save directly to database
        if (taskId && task) {
          void updateTaskLabels({
            taskId: task.id,
            projectId: task.project_id,
            labelIds: Array.from(next),
          });
        } else {
          // For new tasks, update the store
          setStoreSelectedLabels(next);
        }

        return next;
      });
    },
    [taskId, task, updateTaskLabels, setStoreSelectedLabels]
  );

  const handleCreateAndSelect = useCallback(async () => {
    if (!user?.id || !searchQuery.trim()) {
      return;
    }

    try {
      const newLabel = await createLabel({
        profileId: user.id,
        name: searchQuery.trim(),
        color: getRandomColor(),
      });

      // Select the newly created label
      setSelectedLabels((prev) => {
        const next = new Set(prev).add(newLabel.id);

        // If editing an existing task, save directly to database
        if (taskId && task) {
          void updateTaskLabels({
            taskId: task.id,
            projectId: task.project_id,
            labelIds: Array.from(next),
          });
        } else {
          // For new tasks, update the store
          setStoreSelectedLabels(next);
        }

        return next;
      });
      setSearchQuery('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create label.';
      Alert.alert('Create failed', message);
    }
  }, [createLabel, searchQuery, user?.id, taskId, task, updateTaskLabels, setStoreSelectedLabels]);

  const handleDone = useCallback(() => {
    // Only save to store for new tasks (not editing existing tasks)
    if (!taskId) {
      setStoreSelectedLabels(selectedLabels);
    }
    // Navigate back
    router.back();
  }, [router, selectedLabels, setStoreSelectedLabels, taskId]);

  const renderLabelItem = useCallback<ListRenderItem<LabelRow>>(
    ({ item }) => {
      const isSelected = selectedLabels.has(item.id);

      return (
        <Pressable
          className="flex flex-row items-center gap-3 rounded-lg bg-white p-4"
          onPress={() => handleToggleLabel(item.id)}>
          <Checkbox
            isSelected={isSelected}
            onSelectedChange={() => handleToggleLabel(item.id)}
            isOnSurface
          />
          <View
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: item.color || '#6366f1' }}
          />
          <Text className="flex-1 text-base font-medium">{item.name}</Text>
        </Pressable>
      );
    },
    [handleToggleLabel, selectedLabels]
  );

  const listEmpty = (
    <View className="py-10">
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View className="border-border mx-6 rounded-2xl border border-dashed p-6">
          <Text className="text-muted-foreground text-center text-base">
            {searchQuery.trim()
              ? 'No labels found. Create one by typing above.'
              : user?.id
                ? 'No labels yet. Create your first label.'
                : 'Sign in to manage labels.'}
          </Text>
        </View>
      )}
    </View>
  );

  const canCreate = searchQuery.trim() && !exactMatch && !isCreating;

  return (
    <View className="pb-safe flex-1 bg-gray-50">
      <View className="flex flex-row items-center justify-between bg-white px-6 pb-4 pt-6">
        <BackButton />
        <Text className="text-xl font-semibold">Pick Labels</Text>
        <Button className="rounded-full" size="sm" onPress={handleDone} isDisabled={!user?.id}>
          <Button.Label>Done</Button.Label>
        </Button>
      </View>

      <View className="bg-white px-6 pb-4">
        <View className="flex flex-row items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search or create label..."
            className="flex-1 text-base"
            editable={Boolean(user?.id)}
          />
          {canCreate ? (
            <Pressable onPress={handleCreateAndSelect}>
              <View className="rounded-full bg-blue-500 px-3 py-1">
                <Text className="text-sm font-medium text-white">Create</Text>
              </View>
            </Pressable>
          ) : null}
          {isCreating ? <ActivityIndicator size="small" /> : null}
        </View>

        {selectedLabels.size > 0 ? (
          <View className="mt-3">
            <Text className="text-sm text-gray-600">
              {selectedLabels.size} label{selectedLabels.size !== 1 ? 's' : ''} selected
            </Text>
          </View>
        ) : null}
      </View>

      <FlashList
        data={filteredLabels}
        keyExtractor={(item) => item.id}
        renderItem={renderLabelItem}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 96, paddingHorizontal: 24 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
      />
    </View>
  );
}
