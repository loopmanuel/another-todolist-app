import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Stack, useNavigation, useRouter } from 'expo-router';

import { useSearchListsQuery } from '@/features/lists/queries/use-search-lists';
import { useSearchTasksQuery } from '@/features/tasks/queries/use-search-tasks';
import { useAuthStore } from '@/store/auth-store';
import { TaskCard } from '@/features/tasks/components/task-card';
import { ListTile } from '@/features/lists/components/list-tile';
import { useProjectTaskCountsQuery } from '@/features/tasks/queries/use-project-task-counts';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchScreen() {
  const router = useRouter();

  const inset = useSafeAreaInsets();

  const navigation = useNavigation();
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Auto-focus search bar when screen loads
  useLayoutEffect(() => {
    // Delay to ensure navigation is complete
    const timer = setTimeout(() => {
      navigation.setOptions({
        headerSearchBarOptions: {
          placeholder: 'Search lists and tasks...',
          autoFocus: true,
          inputType: 'text',
          onChangeText: (event: any) => {
            setSearchQuery(event.nativeEvent.text);
          },
          onCancelButtonPress: () => {
            setSearchQuery('');
          },
          onSearchButtonPress: (event: any) => {
            setSearchQuery(event.nativeEvent.text);
          },
        },
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [navigation]);

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

  const { data: taskCounts = {} } = useProjectTaskCountsQuery(user?.id);

  const isTyping = searchQuery !== debouncedQuery && searchQuery.trim().length > 0;
  const isSearching = isTyping || listsFetching || tasksFetching;
  const hasQuery = debouncedQuery.trim().length > 0;
  const hasResults = lists.length > 0 || tasks.length > 0;
  const showEmptyState = hasQuery && !isSearching && !hasResults;

  return (
    <View className="flex-1">
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: 'Search lists and tasks...',
            autoFocus: true,
            inputType: 'text',
            onChangeText: (event) => {
              setSearchQuery(event.nativeEvent.text);
            },
            onCancelButtonPress: () => {
              setSearchQuery('');
            },
            onSearchButtonPress: (event) => {
              setSearchQuery(event.nativeEvent.text);
            },
          },
        }}
      />

      {/* Results */}
      <KeyboardAwareScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        style={{ paddingTop: inset.top, paddingBottom: inset.bottom }}>
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
              No results found for &#34;{debouncedQuery}&#34;
            </Text>
          </View>
        ) : (
          <View className="py-4">
            {/* Lists Section */}
            {lists.length > 0 && (
              <View className="mb-6 px-4">
                <Text className="text-muted-foreground mb-3 text-sm font-semibold uppercase">
                  Lists ({lists.length})
                </Text>
                {lists.map((list) => (
                  <ListTile key={list.id} list={list} uncompletedCount={taskCounts[list.id] || 0} />
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
      </KeyboardAwareScrollView>
    </View>
  );
}
