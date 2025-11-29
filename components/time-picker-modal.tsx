import React, { useState } from 'react';
import { Modal, Platform, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Dialog } from 'heroui-native';
import { Text } from '@/components/ui/text';

interface TimePickerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value?: number; // Time in minutes
  onSave: (minutes: number) => void;
}

export function TimePickerModal({ isOpen, onOpenChange, title, value = 0, onSave }: TimePickerModalProps) {
  const [hours, setHours] = useState(Math.floor(value / 60));
  const [minutes, setMinutes] = useState(value % 60);
  const [showPicker, setShowPicker] = useState<'hours' | 'minutes' | null>(null);

  const handleSave = () => {
    const totalMinutes = hours * 60 + minutes;
    onSave(totalMinutes);
    onOpenChange(false);
  };

  const handleClear = () => {
    setHours(0);
    setMinutes(0);
    onSave(0);
    onOpenChange(false);
  };

  const createDate = (value: number) => {
    const date = new Date();
    date.setHours(value);
    date.setMinutes(0);
    return date;
  };

  const handleTimeChange = (event: any, selectedDate?: Date, type?: 'hours' | 'minutes') => {
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }

    if (event.type === 'set' && selectedDate) {
      const pickerType = type || showPicker;
      if (pickerType === 'hours') {
        setHours(selectedDate.getHours());
      } else if (pickerType === 'minutes') {
        setMinutes(selectedDate.getMinutes());
      }
    }
  };

  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Close className="-mb-2 self-end" />
          <View className="mb-5 gap-1.5">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description>
              Set the time in hours and minutes
            </Dialog.Description>
          </View>

          <View className="mb-4 flex-row items-center justify-center gap-4">
            {/* Hours */}
            <View className="items-center gap-2">
              <Text className="text-sm text-muted-foreground">Hours</Text>
              <Button
                variant="bordered"
                className="min-w-20"
                onPress={() => setShowPicker('hours')}>
                <Button.Label>
                  <Text className="text-2xl font-semibold">{hours}</Text>
                </Button.Label>
              </Button>
            </View>

            <Text className="text-2xl font-semibold">:</Text>

            {/* Minutes */}
            <View className="items-center gap-2">
              <Text className="text-sm text-muted-foreground">Minutes</Text>
              <Button
                variant="bordered"
                className="min-w-20"
                onPress={() => setShowPicker('minutes')}>
                <Button.Label>
                  <Text className="text-2xl font-semibold">{minutes.toString().padStart(2, '0')}</Text>
                </Button.Label>
              </Button>
            </View>
          </View>

          {/* Time Picker for Android/iOS */}
          {showPicker && Platform.OS === 'ios' && (
            <View className="mb-4">
              <DateTimePicker
                value={createDate(showPicker === 'hours' ? hours : minutes)}
                mode="time"
                display="spinner"
                onChange={(e, date) => handleTimeChange(e, date, showPicker)}
                minuteInterval={5}
              />
            </View>
          )}

          {showPicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={createDate(showPicker === 'hours' ? hours : minutes)}
              mode="time"
              display="default"
              onChange={(e, date) => handleTimeChange(e, date, showPicker)}
              minuteInterval={5}
            />
          )}

          <View className="flex-row justify-end gap-3">
            <Button variant="ghost" size="sm" onPress={handleClear}>
              <Button.Label>Clear</Button.Label>
            </Button>
            <Button variant="ghost" size="sm" onPress={() => onOpenChange(false)}>
              <Button.Label>Cancel</Button.Label>
            </Button>
            <Button size="sm" onPress={handleSave}>
              <Button.Label>Save</Button.Label>
            </Button>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

// Helper function to format minutes to "Xh Ym" format
export function formatTime(minutes?: number | null): string {
  if (!minutes || minutes === 0) return 'Not set';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
