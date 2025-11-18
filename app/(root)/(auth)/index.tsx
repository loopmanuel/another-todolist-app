import { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from 'react-native';

import { Link } from 'expo-router';
import { Button } from 'heroui-native';

import { Text } from '@/components/ui/text';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BENEFITS = [
  {
    title: 'Stay Organized',
    description: 'Keep all your tasks, projects, and goals in one beautifully simple place.',
    icon: '📋',
  },
  {
    title: 'Work Together',
    description: 'Collaborate with your team and share projects effortlessly.',
    icon: '🤝',
  },
  {
    title: 'Track Progress',
    description: 'Monitor your productivity with subtasks, labels, and priorities.',
    icon: '📈',
  },
  {
    title: 'Access Anywhere',
    description: 'Sync across all your devices and never lose track of what matters.',
    icon: '☁️',
  },
];

export default function LandingScreen() {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveSlide(slideIndex);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Benefits Slider */}
      <View className="flex-1 justify-center">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={SCREEN_WIDTH}
          snapToAlignment="center">
          {BENEFITS.map((benefit, index) => (
            <View
              key={index}
              className="items-center justify-center px-8"
              style={{ width: SCREEN_WIDTH }}>
              <Text className="mb-6 text-7xl">{benefit.icon}</Text>
              <Text variant="h1" className="mb-4 text-center text-3xl font-bold">
                {benefit.title}
              </Text>
              <Text className="text-center text-lg text-muted-foreground">
                {benefit.description}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Pagination Dots */}
        <View className="mb-8 flex-row justify-center gap-2">
          {BENEFITS.map((_, index) => (
            <View
              key={index}
              className={`h-2 rounded-full ${
                index === activeSlide ? 'w-8 bg-black' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="px-6 pb-10">
        <Link href="/login" asChild>
          <Button className="mb-3 rounded-full bg-black">
            <Button.Label>Get Started</Button.Label>
          </Button>
        </Link>

        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-muted-foreground">Already have an account?</Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text className="font-semibold text-black">Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}
