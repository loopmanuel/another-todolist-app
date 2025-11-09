import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useSearchListsQuery } from '@/features/lists/queries/use-search-lists';
import { useSearchTasksQuery } from '@/features/tasks/queries/use-search-tasks';
import { useAuthStore } from '@/store/auth-store';
import { cn } from '@/lib/utils';

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
      <View className="flex flex-row items-center gap-3 border-b border-border px-4 py-4">
        <Pressable onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            autoFocus
            placeholder="Search lists and tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-base placeholder:text-muted-foreground/60"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} className="p-1">
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Results */}
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {!hasQuery ? (
          <View className="py-20">
            <Text className="text-center text-muted-foreground">
              Start typing to search lists and tasks
            </Text>
          </View>
        ) : isSearching ? (
          <View className="py-20">
            <ActivityIndicator size="large" />
          </View>
        ) : showEmptyState ? (
          <View className="py-20">
            <Text className="text-center text-muted-foreground">No results found for "{debouncedQuery}"</Text>
          </View>
        ) : (
          <View className="py-4">
            {/* Lists Section */}
            {lists.length > 0 && (
              <View className="mb-6">
                <Text className="mb-3 px-4 text-sm font-semibold uppercase text-muted-foreground">
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
                      'flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-gray-50'
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
                <Text className="mb-3 px-4 text-sm font-semibold uppercase text-muted-foreground">
                  Tasks ({tasks.length})
                </Text>
                {tasks.map((task) => (
                  <Pressable
                    key={task.id}
                    onPress={() => {
                      router.dismiss();
                      router.push(`/task/${task.id}`);
                    }}
                    className={cn(
                      'flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-gray-50'
                    )}>
                    <View className="flex-1">
                      <Text
                        className={cn(
                          'text-base font-medium',
                          task.status === 'done' && 'text-muted-foreground line-through'
                        )}>
                        {task.title}
                      </Text>
                      {task.description && (
                        <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={1}>
                          {task.description}
                        </Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
