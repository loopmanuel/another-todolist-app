import { View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Calendar, CalendarProps } from 'react-native-calendars';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMMKVString } from 'react-native-mmkv';
import BackButton from '@/components/ui/back-button';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';

type DayPress = Parameters<NonNullable<CalendarProps['onDayPress']>>[0];

// Helper: "YYYY-MM-DD" in LOCAL time (avoids UTC off-by-one)
function todayLocal(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DatePicker() {
  const router = useRouter();

  // Persisted value (may be undefined on first render if not set yet)
  const [dateMMKV, setDateMMKV] = useMMKVString('date');

  // Start with today; we’ll sync with MMKV below if a value exists
  const [selected, setSelected] = useState<string>(todayLocal());

  // On mount or when MMKV changes, sync state.
  useEffect(() => {
    if (dateMMKV && dateMMKV !== selected) {
      setSelected(dateMMKV);
    } else if (!dateMMKV) {
      // Initialize MMKV with today's date if not set
      const t = todayLocal();
      setSelected(t);
      setDateMMKV?.(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMMKV]);

  const onDayPress = useCallback(
    (day: DayPress) => {
      setSelected(day.dateString);
      setDateMMKV?.(day.dateString);
    },
    [setDateMMKV]
  );

  const marked = useMemo(
    () => ({
      [selected]: { selected: true, selectedColor: 'black', selectedTextColor: 'white' },
    }),
    [selected]
  );

  return (
    <View className="pb-safe flex-1 bg-white">
      <View className={'flex flex-row items-center justify-between pb-6 pt-6'}>
        <Button className={'ml-4'} variant={'tertiary'} onPress={() => router.dismiss()}>
          <Button.Label>Clear</Button.Label>
        </Button>

        <Button className={'mr-4 rounded-full'} isIconOnly onPress={() => router.dismiss()}>
          <Button.Label>
            <Ionicons name={'checkmark-outline'} size={22} />
          </Button.Label>
        </Button>
      </View>

      <Calendar
        current={selected} // keep calendar focused on the selected day
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
