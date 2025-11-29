import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Dialog } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTimerStore, formatElapsedTime, type TimerSession } from '@/store/timer-store';
import { useRouter } from 'expo-router';

interface ActiveTimersModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onTimerStopped?: (taskId: string, minutes: number) => void;
}

function TimerRow({ session, onTimerStopped }: { session: TimerSession; onTimerStopped?: (taskId: string, minutes: number) => void }) {
  const router = useRouter();
  const { pauseTimer, resumeTimer, stopTimer, getActiveTime } = useTimerStore();
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Update elapsed time every second
    const interval = setInterval(() => {
      setElapsedTime(getActiveTime(session.id));
    }, 1000);

    return () => clearInterval(interval);
  }, [session.id, getActiveTime]);

  const handleStop = () => {
    const totalMinutes = stopTimer(session.id);
    onTimerStopped?.(session.taskId, totalMinutes);
  };

  const handleTogglePause = () => {
    if (session.isPaused) {
      resumeTimer(session.id);
    } else {
      pauseTimer(session.id);
    }
  };

  const handleGoToTask = () => {
    router.push(`/task/${session.taskId}`);
  };

  return (
    <View className="mb-3 rounded-lg border border-gray-200 p-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="flex-1 text-base font-semibold" numberOfLines={1}>
          {session.taskTitle}
        </Text>
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          onPress={handleGoToTask}>
          <Ionicons name="open-outline" size={18} />
        </Button>
      </View>

      <View className="mb-3">
        <Text className="text-3xl font-bold tabular-nums">
          {formatElapsedTime(elapsedTime)}
        </Text>
        {session.isPaused && (
          <Text className="text-sm text-yellow-600">Paused</Text>
        )}
      </View>

      <View className="flex-row gap-2">
        <Button
          size="sm"
          variant="bordered"
          className="flex-1"
          onPress={handleTogglePause}>
          <Ionicons
            name={session.isPaused ? 'play' : 'pause'}
            size={16}
          />
          <Button.Label>
            {session.isPaused ? 'Resume' : 'Pause'}
          </Button.Label>
        </Button>

        <Button
          size="sm"
          variant="destructive-soft"
          className="flex-1"
          onPress={handleStop}>
          <Ionicons name="stop" size={16} />
          <Button.Label>Stop</Button.Label>
        </Button>
      </View>
    </View>
  );
}

export function ActiveTimersModal({ isOpen, onOpenChange, onTimerStopped }: ActiveTimersModalProps) {
  const { sessions } = useTimerStore();

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content className="max-h-[80vh]">
          <Dialog.Close className="-mb-2 self-end" />
          <View className="mb-4 gap-1.5">
            <Dialog.Title>Active Timers</Dialog.Title>
            <Dialog.Description>
              {sessions.length === 0
                ? 'No active timers'
                : `${sessions.length} timer${sessions.length > 1 ? 's' : ''} running`}
            </Dialog.Description>
          </View>

          {sessions.length > 0 ? (
            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              {sessions.map((session) => (
                <TimerRow
                  key={session.id}
                  session={session}
                  onTimerStopped={onTimerStopped}
                />
              ))}
            </ScrollView>
          ) : (
            <View className="py-8">
              <Text className="text-muted-foreground text-center">
                No active timers. Start tracking time on a task to see it here.
              </Text>
            </View>
          )}

          <View className="mt-4 flex-row justify-end">
            <Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>
              <Button.Label>Close</Button.Label>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
