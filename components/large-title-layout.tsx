// LargeTitleLayout.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, type ViewProps } from 'react-native';
import { useNavigation } from 'expo-router';
import {
  HeaderTitle as HeaderTitleComponent,
  HeaderTitleProps,
  useHeaderHeight,
} from '@react-navigation/elements';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { LargeTitle } from '@/components/large-title';
import { useScrollViewOffset } from '@/lib/hooks/use-scroll-view-offset';

type LargeTitleLayoutRenderProps = {
  onScroll: ReturnType<typeof useScrollViewOffset>['scrollHandler'];
  setScrollY: (y: number) => void;
  ListHeaderSpacer: React.ComponentType;
  contentContainerStyle: { paddingHorizontal: number; paddingBottom: number };
};

type LargeTitleLayoutProps = Omit<ViewProps, 'children'> & {
  title: string;
  gapBelowTitle?: number;
  pagePadding?: number;
  children: (props: LargeTitleLayoutRenderProps) => React.ReactElement | null;
};

export function LargeTitleLayout({
  title,
  gapBelowTitle = 0,
  pagePadding = 20,
  style,
  children,
  ...rest
}: LargeTitleLayoutProps) {
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const [largeTitleHeight, setLargeTitleHeight] = useState(92);

  const { scrollOffsetY, scrollHandler } = useScrollViewOffset();

  const setScrollY = React.useCallback(
    (y: number) => {
      'worklet';
      scrollOffsetY.value = y;
    },
    [scrollOffsetY]
  );

  const rImageHeaderHeight = useSharedValue(200);

  const rInputRange = useDerivedValue(() => {
    const start = rImageHeaderHeight.value * 0.2;
    const end = rImageHeaderHeight.value - headerHeight;
    return [start, end];
  });

  const rHeaderTitleContainerStyle = useAnimatedStyle(() => ({
    opacity: withTiming(scrollOffsetY.value > rInputRange.value[1] ? 1 : 0),
  }));

  const rListHeaderStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollOffsetY.value,
          [-100, 0, largeTitleHeight],
          [100, 0, -largeTitleHeight],
          { extrapolateRight: 'clamp' }
        ),
      },
    ],
  }));

  useEffect(() => {
    navigation.setOptions({
      headerTitle: (props: HeaderTitleProps) => (
        <Animated.View style={rHeaderTitleContainerStyle}>
          <HeaderTitleComponent {...props}>{title}</HeaderTitleComponent>
        </Animated.View>
      ),
    });
  }, [navigation, rHeaderTitleContainerStyle, title]);

  const ListHeaderSpacer = useMemo(
    () =>
      function Spacer() {
        return <View style={{ height: headerHeight + largeTitleHeight + gapBelowTitle }} />;
      },
    [headerHeight, largeTitleHeight, gapBelowTitle]
  );

  return (
    <View style={[{ flex: 1 }, style]} {...rest}>
      <Animated.View
        style={[
          { position: 'absolute', left: 0, right: 0, top: 40, paddingHorizontal: 20 },
          rListHeaderStyle,
        ]}
        onLayout={(e) => rImageHeaderHeight.set(e.nativeEvent.layout.height)}>
        <View
          style={{ paddingTop: largeTitleHeight }}
          onLayout={({ nativeEvent }) => {
            if (largeTitleHeight === 0) setLargeTitleHeight(nativeEvent.layout.height);
          }}>
          <LargeTitle title={title} offsetY={scrollOffsetY} />
        </View>
        <View style={{ height: gapBelowTitle }} />
      </Animated.View>

      {children({
        onScroll: scrollHandler,
        setScrollY,
        ListHeaderSpacer,
        contentContainerStyle: { paddingHorizontal: pagePadding, paddingBottom: 96 },
      })}
    </View>
  );
}
