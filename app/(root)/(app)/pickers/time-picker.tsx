import { Platform, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text } from '@/components/ui/text';
import { useTimePickerStore } from '@/store/time-picker-store';

export default function TimePicker() {
  const router = useRouter();

  const [date, setDate] = useState(new Date(1598051730000));

  const { selectedTime, setSelectedTime, clearTime } = useTimePickerStore();

  // Initialize hours and minutes from selected time
  const [hours, setHours] = useState(Math.floor((selectedTime ?? 0) / 60));
  const [minutes, setMinutes] = useState((selectedTime ?? 0) % 60);
  const [showPicker, setShowPicker] = useState<'hours' | 'minutes' | null>(null);

  const handleClear = useCallback(() => {
    clearTime();
    setHours(0);
    setMinutes(0);
    router.dismiss();
  }, [clearTime, router]);

  const handleDone = useCallback(() => {
    const totalMinutes = hours * 60 + minutes;
    setSelectedTime(totalMinutes > 0 ? totalMinutes : null);
    router.dismiss();
  }, [hours, minutes, setSelectedTime, router]);

  const createDate = (value: number, type: 'hours' | 'minutes') => {
    const date = new Date();
    if (type === 'hours') {
      date.setHours(value);
      date.setMinutes(0);
    } else {
      date.setHours(0);
      date.setMinutes(value);
    }
    return date;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }

    if (event.type === 'set' && selectedDate) {
      if (showPicker === 'hours') {
        setHours(selectedDate.getHours());
      } else if (showPicker === 'minutes') {
        setMinutes(selectedDate.getMinutes());
      }
    } else if (event.type === 'dismissed') {
      setShowPicker(null);
    }
  };

  // Quick time selection handlers
  const handleQuickTime = useCallback((h: number, m: number) => {
    setHours(h);
    setMinutes(m);
  }, []);

  const onChange = (event: any, selectedDate: any) => {
    setDate(selectedDate);
  };

  return (
    <View className="pb-safe flex-1 bg-white">
      {/* Header */}
      <View className={'flex flex-row items-center justify-between pb-6 pt-6'}>
        <Button className={'ml-4'} variant={'tertiary'} onPress={handleClear}>
          <Button.Label>Clear</Button.Label>
        </Button>

        <Button className={'mr-4 rounded-full'} isIconOnly onPress={handleDone}>
          <Button.Label>
            <Ionicons name={'checkmark-outline'} size={22} />
          </Button.Label>
        </Button>
      </View>

      {/* Quick time selection buttons */}
      <View className={'mx-4 mb-6 flex flex-row gap-2'}>
        <Button
          className={'flex-1'}
          variant={'secondary'}
          size={'sm'}
          onPress={() => handleQuickTime(0, 15)}>
          <Button.Label>15m</Button.Label>
        </Button>
        <Button
          className={'flex-1'}
          variant={'secondary'}
          size={'sm'}
          onPress={() => handleQuickTime(0, 30)}>
          <Button.Label>30m</Button.Label>
        </Button>
        <Button
          className={'flex-1'}
          variant={'secondary'}
          size={'sm'}
          onPress={() => handleQuickTime(1, 0)}>
          <Button.Label>1h</Button.Label>
        </Button>
        <Button
          className={'flex-1'}
          variant={'secondary'}
          size={'sm'}
          onPress={() => handleQuickTime(2, 0)}>
          <Button.Label>2h</Button.Label>
        </Button>
      </View>

      {/* Time display and picker triggers */}
      <View className="mx-4 mb-6 items-center">
        <Text className="text-muted-foreground mb-4 text-sm">Set Time</Text>

        <View className="flex-row items-center gap-4">
          {/* Hours */}
          <Pressable
            onPress={() => setShowPicker('hours')}
            className="border-border items-center rounded-lg border bg-gray-50 px-6 py-4">
            <Text className="text-muted-foreground mb-1 text-xs">Hours</Text>
            <Text className="text-4xl font-semibold">{hours}</Text>
          </Pressable>

          <Text className="text-3xl font-semibold">:</Text>

          {/* Minutes */}
          <Pressable
            onPress={() => setShowPicker('minutes')}
            className="border-border items-center rounded-lg border bg-gray-50 px-6 py-4">
            <Text className="text-muted-foreground mb-1 text-xs">Minutes</Text>
            <Text className="text-4xl font-semibold">{minutes.toString().padStart(2, '0')}</Text>
          </Pressable>
        </View>

        <Text className="text-muted-foreground mt-4 text-sm">
          Total: {hours}h {minutes}m ({hours * 60 + minutes} minutes)
        </Text>
      </View>

      <DateTimePicker
        value={date}
        mode="time"
        display="spinner"
        onChange={onChange}
        minuteInterval={5}
      />

      <Text>test</Text>

      {/* iOS Time Picker */}
      {showPicker && Platform.OS === 'ios' && (
        <View className="mx-4">
          <DateTimePicker
            value={createDate(showPicker === 'hours' ? hours : minutes, showPicker)}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
            minuteInterval={5}
          />
        </View>
      )}

      {/* Android Time Picker */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={createDate(showPicker === 'hours' ? hours : minutes, showPicker)}
          mode="time"
          display="default"
          onChange={handleTimeChange}
          minuteInterval={5}
        />
      )}
    </View>
  );
}
