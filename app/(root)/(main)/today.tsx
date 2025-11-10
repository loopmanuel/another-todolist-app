import { ActivityIndicator, View } from 'react-native';

import { FlashList } from '@shopify/flash-list';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';

import { useTodayTasksQuery } from '@/features/tasks/queries/use-today-tasks';
import { useAuthStore } from '@/store/auth-store';
import { TaskCard } from '@/features/tasks/components/task-card';
import { useState } from 'react';

import { AnimatedLegendList } from '@legendapp/list/reanimated';

import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { LargeTitle } from '@/components/large-title';

export default function TodayScreen() {
  const router = useRouter();

  const [headerHeight, setHeaderHeight] = useState(0);
  const [largeTitleHeight, setLargeTitleHeight] = useState(0);

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const {
    data: tasks = [],
    isLoading,
    isRefetching,
    refetch,
  } = useTodayTasksQuery({ createdBy: user?.id });

  const offsetY = useSharedValue(0);

  const rListHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            offsetY.value,
            [-100, 0, largeTitleHeight],
            [100, 0, -largeTitleHeight],
            {
              extrapolateRight: 'clamp',
            }
          ),
        },
      ],
    };
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: ({ contentOffset: { y } }) => {
      offsetY.value = y;
    },
  });

  const listEmpty = (
    <View className="py-10">
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View className="border-border mx-6 rounded-2xl border border-dashed p-6">
          <Text className="text-muted-foreground text-center text-base">
            {user?.id ? 'No tasks due today.' : 'Sign in to view your tasks.'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View className={'flex-1'}>
      <Animated.View
        className="absolute left-0 right-0 top-0 px-5"
        style={rListHeaderStyle}
        onLayout={({ nativeEvent }) => {
          if (headerHeight === 0) {
            setHeaderHeight(nativeEvent.layout.height);
          }
        }}>
        <View
          onLayout={({ nativeEvent }) => {
            if (largeTitleHeight === 0) {
              setLargeTitleHeight(nativeEvent.layout.height);
            }
          }}>
          <LargeTitle title="Calls" offsetY={offsetY} className="mb-4 pt-4" />
        </View>
      </Animated.View>

      <AnimatedLegendList
        data={tasks}
        renderItem={({ item }) => (
          <View className={'mb-3'}>
            <TaskCard task={item} onPress={(task) => router.push(`/task/${task.id}`)} />
          </View>
        )}
        contentContainerClassName="gap-0 p-5 pt-3"
        contentContainerStyle={{ paddingTop: headerHeight + 16 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={1000 / 60}
        onScroll={scrollHandler}
      />
    </View>
  );
}
