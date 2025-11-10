import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useNavigation, useRouter } from 'expo-router';

import { useTodayTasksQuery } from '@/features/tasks/queries/use-today-tasks';
import { useAuthStore } from '@/store/auth-store';
import { TaskCard } from '@/features/tasks/components/task-card';
import { useEffect, useState } from 'react';

import { AnimatedLegendList } from '@legendapp/list/reanimated';

import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LargeTitle } from '@/components/large-title';
import {
  HeaderTitleProps,
  useHeaderHeight,
  HeaderTitle as HeaderTitleComponent,
} from '@react-navigation/elements';
import { useScrollViewOffset } from '@/lib/hooks/use-scroll-view-offset';

export default function TodayScreen() {
  const router = useRouter();

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const {
    data: tasks = [],
    isLoading,
    isRefetching,
    refetch,
  } = useTodayTasksQuery({ createdBy: user?.id });

  // Native header height from navigation stack - used for layout calculations
  const headerHeight = useHeaderHeight();

  const navigation = useNavigation();
  const [largeTitleHeight, setLargeTitleHeight] = useState(92);

  // Real-time scroll Y position - drives all header transition animations
  const { scrollOffsetY, scrollHandler } = useScrollViewOffset();
  // Dynamic height of the hero section - measured via onLayout for responsive calculations
  const rImageHeaderHeight = useSharedValue(200); // Initial fallback: 200px

  // Scroll-based transition boundaries - calculated from hero section dimensions
  const rInputRange = useDerivedValue(() => {
    // Transition starts at 20% of hero height - early enough to feel responsive
    const start = rImageHeaderHeight.value * 0.2;
    // Transition completes when hero section exits viewport (minus native header)
    const end = rImageHeaderHeight.value - headerHeight;
    return [start, end]; // [startScroll, endScroll] - used across all interpolations
  });

  // Header title visibility - appears only when hero section is fully scrolled out
  const rHeaderTitleContainerStyle = useAnimatedStyle(() => {
    return {
      // Binary transition at end boundary - 0 (hidden) → 1 (visible) with timing animation
      opacity: withTiming(scrollOffsetY.value > rInputRange.value[1] ? 1 : 0),
    };
  });

  // Header parallax animation: creates sticky header effect with smooth transitions
  const rListHeaderStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffsetY.value,
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

  useEffect(() => {
    navigation.setOptions({
      headerTitle: (props: HeaderTitleProps) => {
        return (
          <Animated.View style={rHeaderTitleContainerStyle}>
            <HeaderTitleComponent {...props}>Today</HeaderTitleComponent>
          </Animated.View>
        );
      },
    });
  }, [navigation, rHeaderTitleContainerStyle]);

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
        className="absolute left-0 right-0 top-10 px-5 pb-2"
        style={rListHeaderStyle}
        onLayout={(e) => rImageHeaderHeight.set(e.nativeEvent.layout.height)}>
        <View
          style={{ paddingTop: largeTitleHeight }}
          onLayout={({ nativeEvent }) => {
            if (largeTitleHeight === 0) {
              setLargeTitleHeight(nativeEvent.layout.height);
            }
          }}>
          <LargeTitle title="Today" offsetY={scrollOffsetY} className="mb-4 pt-4" />
        </View>
      </Animated.View>

      <AnimatedLegendList
        data={tasks}
        renderItem={({ item }) => (
          <View className={'mb-3'}>
            <TaskCard task={item} onPress={(task) => router.push(`/task/${task.id}`)} />
          </View>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={listEmpty}
        ListHeaderComponent={() => (
          <View style={{ height: headerHeight + largeTitleHeight + 16 }} />
        )}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 96,
        }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
        recycleItems
        nestedScrollEnabled
      />
    </View>
  );
}
