import React, { useEffect, useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTimerStore, formatElapsedTime } from '@/store/timer-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

interface PersistentTimerNotificationProps {
  onPress: () => void;
}

export function PersistentTimerNotification({ onPress }: PersistentTimerNotificationProps) {
  const { sessions, getActiveTime } = useTimerStore();
  const [tick, setTick] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (sessions.length === 0) return;

    // Force re-render every second to update timer display
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessions.length]);

  if (sessions.length === 0) return null;

  const activeSession = sessions[0]; // Show first timer
  const elapsedTime = getActiveTime(activeSession.id);
  const formattedTime = formatElapsedTime(elapsedTime);

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={[styles.container, { top: insets.top + 8 }]}>
      <Pressable
        onPress={onPress}
        className="mx-4 flex-row items-center gap-3 rounded-lg bg-blue-600 p-4 shadow-lg"
        style={styles.shadow}>
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full">
            {!activeSession.isPaused && (
              <View className="h-2 w-2 rounded-full bg-green-400" />
            )}
          </View>
          <Ionicons
            name={activeSession.isPaused ? 'pause' : 'timer'}
            size={20}
            color="white"
          />
        </View>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-white" numberOfLines={1}>
            {activeSession.taskTitle}
          </Text>
          <Text className="text-xs text-blue-100">
            {formattedTime}
            {activeSession.isPaused && ' (Paused)'}
            {sessions.length > 1 && ` +${sessions.length - 1} more`}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="white" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
