import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, CalendarProps } from 'react-native-calendars';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';

import { useDatePickerStore } from '@/store/date-picker-store';
import { useTaskQuery } from '@/features/tasks/queries/use-task';
import { useUpdateTaskMutation } from '@/features/tasks/mutations/use-update-task';
import { useAuthStore } from '@/store/auth-store';

type DayPress = Parameters<NonNullable<CalendarProps['onDayPress']>>[0];

export default function DatePicker() {
  const router = useRouter();
  const params = useLocalSearchParams<{ taskId?: string }>();
  const taskId = params.taskId;

  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { selectedDate: storeSelectedDate, setSelectedDate: setStoreSelectedDate, clearDate: clearStoreDate, getTodayLocal } = useDatePickerStore();

  // Fetch task data if editing an existing task
  const { data: task } = useTaskQuery({ taskId, createdBy: user?.id });
  const { mutateAsync: updateTask } = useUpdateTaskMutation();

  // Use local state for current selection
  const [selectedDate, setSelectedDate] = useState<string | null>(
    taskId && task ? (task.due_at ? dayjs(task.due_at).format('YYYY-MM-DD') : null) : storeSelectedDate
  );

  // Initialize selected date from task when editing
  useEffect(() => {
    if (taskId && task) {
      setSelectedDate(task.due_at ? dayjs(task.due_at).format('YYYY-MM-DD') : null);
    }
  }, [taskId, task]);

  const saveDate = useCallback(
    async (date: string | null) => {
      if (taskId && task) {
        // Save directly to database for existing tasks
        await updateTask({
          taskId: task.id,
          projectId: task.project_id,
          payload: {
            due_at: date ? `${date}T12:00:00.000Z` : null,
          },
        });
      } else {
        // For new tasks, update the store
        if (date) {
          setStoreSelectedDate(date);
        } else {
          clearStoreDate();
        }
      }
    },
    [taskId, task, updateTask, setStoreSelectedDate, clearStoreDate]
  );

  const onDayPress = useCallback(
    async (day: DayPress) => {
      setSelectedDate(day.dateString);
      await saveDate(day.dateString);
    },
    [saveDate]
  );

  const handleClear = useCallback(async () => {
    setSelectedDate(null);
    await saveDate(null);
    router.dismiss();
  }, [saveDate, router]);

  const handleToday = useCallback(async () => {
    const today = getTodayLocal();
    setSelectedDate(today);
    await saveDate(today);
  }, [saveDate, getTodayLocal]);

  const handleTomorrow = useCallback(async () => {
    const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
    setSelectedDate(tomorrow);
    await saveDate(tomorrow);
  }, [saveDate]);

  const handleNextMonday = useCallback(async () => {
    const today = dayjs();
    const currentDay = today.day(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate days until next Monday
    let daysUntilMonday: number;
    if (currentDay === 1) {
      // If today is Monday, next Monday is in 7 days
      daysUntilMonday = 7;
    } else if (currentDay === 0) {
      // If today is Sunday, next Monday is tomorrow
      daysUntilMonday = 1;
    } else {
      // For other days, calculate days until next Monday
      daysUntilMonday = 8 - currentDay;
    }

    const nextMonday = today.add(daysUntilMonday, 'day').format('YYYY-MM-DD');
    setSelectedDate(nextMonday);
    await saveDate(nextMonday);
  }, [saveDate]);

  const marked = useMemo(() => {
    if (!selectedDate) return {};
    return {
      [selectedDate]: { selected: true, selectedColor: 'black', selectedTextColor: 'white' },
    };
  }, [selectedDate]);

  // Use selected date for calendar current, or default to today for initial view
  const calendarCurrent = selectedDate || getTodayLocal();

  return (
    <View className="pb-safe flex-1 bg-white">
      <View className={'flex flex-row items-center justify-between pb-6 pt-6'}>
        <Button className={'ml-4'} variant={'tertiary'} onPress={handleClear}>
          <Button.Label>Clear</Button.Label>
        </Button>

        <Button className={'mr-4 rounded-full'} isIconOnly onPress={() => router.dismiss()}>
          <Button.Label>
            <Ionicons name={'checkmark-outline'} size={22} />
          </Button.Label>
        </Button>
      </View>

      {/* Quick date selection buttons */}
      <View className={'mx-4 mb-4 flex flex-row gap-2'}>
        <Button
          className={'flex-1'}
          variant={'secondary'}
          size={'sm'}
          onPress={handleToday}>
          <Button.Label>Today</Button.Label>
        </Button>
        <Button
          className={'flex-1'}
          variant={'secondary'}
          size={'sm'}
          onPress={handleTomorrow}>
          <Button.Label>Tomorrow</Button.Label>
        </Button>
        <Button
          className={'flex-1'}
          variant={'secondary'}
          size={'sm'}
          onPress={handleNextMonday}>
          <Button.Label>Next Monday</Button.Label>
        </Button>
      </View>

      <Calendar
        current={calendarCurrent} // keep calendar focused on the selected day or today
        markedDates={marked}
        onDayPress={onDayPress}
        enableSwipeMonths={false}
        theme={{
          arrowColor: 'black',
          textSectionTitleColor: '#b6c1cd',
          textDayFontWeight: '500',
        }}
      />
    </View>
  );
}
