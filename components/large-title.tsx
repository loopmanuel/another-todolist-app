import { useNavigation } from 'expo-router';
import React, { FC, useEffect } from 'react';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { HeaderTitle as HeaderTitleComponent, HeaderTitleProps } from '@react-navigation/elements';
import { cn } from 'heroui-native';

// viber-header-large-title-animation 🔽
// viber-chats-header-animation 🔽

type Props = {
  title: string;
  offsetY: SharedValue<number>; // Shared scroll position drives both header and large title animations
  searchBarAnimationDistance?: number; // Distance needed for search bar collapse animation (height + margin delta)
  className?: string;
};

export const LargeTitle: FC<Props> = ({
  title,
  offsetY,
  searchBarAnimationDistance = 0,
  className,
}) => {
  const navigation = useNavigation();

  // Tracks the bottom edge of large title for precise animation trigger calculations
  // Set via onLayout callback when component measures its position
  const headerBaselineY = useSharedValue(0);

  // Header title animation: appears when large title disappears
  const rTitleOpacityStyle = useAnimatedStyle(() => {
    if (headerBaselineY.value <= 0) return { opacity: 0 }; // Hide until layout measured

    // Total distance = large title height + search bar animation distance
    // Ensures header title appears after both large title and search bar are hidden
    const scrollDistance = headerBaselineY.value + searchBarAnimationDistance;

    return {
      // withTiming creates smooth fade transition instead of instant opacity change
      opacity: withTiming(offsetY.value > scrollDistance ? 1 : 0),
    };
  });

  // Large title animation: fades out during scroll and scales on pull-to-refresh
  const rLargeTitleStyle = useAnimatedStyle(() => {
    if (headerBaselineY.value <= 0) return { opacity: 1 }; // Show until layout measured

    // Same trigger point as header title but inverted logic
    const scrollDistance = headerBaselineY.value + searchBarAnimationDistance;

    return {
      // Instant opacity change for snappy large title disappearance
      opacity: offsetY.value < scrollDistance ? 1 : 0,
      // Pull-to-refresh scale effect: -200px scroll creates 10% scale increase
      // Input range [-200, 0] maps to scale [1.1, 1.0] for subtle zoom on overscroll
      // CLAMP prevents over-scaling beyond defined range
      transform: [{ scale: interpolate(offsetY.value, [0, -200], [1, 1.1], Extrapolation.CLAMP) }],
    };
  });

  // Dynamically inject animated header title into navigation header
  // Required because React Navigation doesn't support animated components directly
  useEffect(() => {
    navigation.setOptions({
      headerTitle: (props: HeaderTitleProps) => {
        return (
          // Animated.View wrapper enables Reanimated animations on navigation header
          <Animated.View style={rTitleOpacityStyle}>
            <HeaderTitleComponent {...props}>{title}</HeaderTitleComponent>
          </Animated.View>
        );
      },
    });
  }, [title, navigation]);

  return (
    <Animated.Text
      className={cn('text-3xl font-bold text-black', className)}
      style={[rLargeTitleStyle, { transformOrigin: 'left' }]} // Left origin for natural iOS-style scaling
      onLayout={({ nativeEvent }) =>
        // Calculate bottom edge position (y + height) for precise animation trigger
        // This measurement drives both header title and large title animation timing
        headerBaselineY.set(nativeEvent.layout.y + nativeEvent.layout.height)
      }>
      {title}
    </Animated.Text>
  );
};

// viber-chats-header-animation 🔼
// viber-header-large-title-animation 🔼
