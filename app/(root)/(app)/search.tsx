import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useSearchListsQuery } from '@/features/lists/queries/use-search-lists';
import { useSearchTasksQuery } from '@/features/tasks/queries/use-search-tasks';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';
import { TextField } from 'heroui-native';
import { TaskCard } from '@/features/tasks/components/task-card';

export default function SearchScreen() {
  const router = useRouter();
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const {
    data: lists = [],
    isLoading: listsLoading,
    isFetching: listsFetching,
  } = useSearchListsQuery(debouncedQuery, user?.id);

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isFetching: tasksFetching,
  } = useSearchTasksQuery(debouncedQuery, user?.id);

  const isTyping = searchQuery !== debouncedQuery && searchQuery.trim().length > 0;
  const isSearching = isTyping || listsFetching || tasksFetching;
  const hasQuery = debouncedQuery.trim().length > 0;
  const hasResults = lists.length > 0 || tasks.length > 0;
  const showEmptyState = hasQuery && !isSearching && !hasResults;

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="border-border flex flex-row items-center gap-3 border-b px-4 py-4">
        <Pressable onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>

        <TextField className={'flex-1 text-red-500'}>
          <TextField.Input
            autoFocus
            classNames={{ input: '', container: 'bg-gray-200' }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search lists and tasks...">
            <TextField.InputStartContent>
              <Ionicons name="search" size={20} color="#6b7280" />
            </TextField.InputStartContent>

            {searchQuery.length > 0 && (
              <TextField.InputEndContent>
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#6b7280" />
                </Pressable>
              </TextField.InputEndContent>
            )}
          </TextField.Input>
        </TextField>
      </View>

      {/* Results */}
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {!hasQuery ? (
          <View className="py-20">
            <Text className="text-muted-foreground text-center">
              Start typing to search lists and tasks
            </Text>
          </View>
        ) : isSearching ? (
          <View className="py-20">
            <ActivityIndicator size="large" />
          </View>
        ) : showEmptyState ? (
          <View className="py-20">
            <Text className="text-muted-foreground text-center">
              No results found for "{debouncedQuery}"
            </Text>
          </View>
        ) : (
          <View className="py-4">
            {/* Lists Section */}
            {lists.length > 0 && (
              <View className="mb-6">
                <Text className="text-muted-foreground mb-3 px-4 text-sm font-semibold uppercase">
                  Lists ({lists.length})
                </Text>
                {lists.map((list) => (
                  <Pressable
                    key={list.id}
                    onPress={() => {
                      router.dismiss();
                      router.push(`/lists/${list.id}`);
                    }}
                    className={cn(
                      'border-border flex-row items-center gap-3 border-b px-4 py-3 active:bg-gray-50'
                    )}>
                    <View
                      className="h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: list.color || '#9ca3af' }}>
                      <Text className="text-lg">{list.icon || '📋'}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium">{list.name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </Pressable>
                ))}
              </View>
            )}

            {/* Tasks Section */}
            {tasks.length > 0 && (
              <View>
                <Text className="text-muted-foreground mb-3 px-4 text-sm font-semibold uppercase">
                  Tasks ({tasks.length})
                </Text>
                <View className="px-4">
                  {tasks.map((task) => (
                    <View key={task.id} className="mb-3">
                      <TaskCard
                        task={task}
                        onPress={(selectedTask) => {
                          router.dismiss();
                          router.push(`/task/${selectedTask.id}`);
                        }}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
