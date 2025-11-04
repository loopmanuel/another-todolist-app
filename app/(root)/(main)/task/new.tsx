import { Text } from '@/components/ui/text';
import {
  ScrollView,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import React from 'react';
import BackButton from '@/components/ui/back-button';

export default function NewTask() {
  const router = useRouter();
  const inputRef = React.useRef<TextInput>(null);

  useFocusEffect(
    React.useCallback(() => {
      inputRef.current?.focus();
    }, [])
  );

  const handleDateButtonPress = () => {
    Keyboard.dismiss();
    router.push('/task/date-picker');
  };

  const handlePriorityButtonPress = () => {
    Keyboard.dismiss();

    router.push('/task/priority-select');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}>
      <View className={'flex-1'}>
        <View className={'pt-6'}>
          <BackButton isClose />
        </View>

        <ScrollView className={''} keyboardShouldPersistTaps={'always'}>
          <View className={'p-6 pb-0'}>
            <TextInput
              ref={inputRef}
              placeholder={'New Task'}
              className={
                'w-full min-w-0 px-0 py-2 text-2xl font-semibold placeholder:text-muted-foreground/80'
              }
              autoFocus
            />
          </View>

          <View className={'px-6 pb-6 pt-0'}>
            <TextInput
              placeholder={'Description'}
              className={
                'w-full min-w-0 px-0 py-2 text-base font-medium placeholder:text-muted-foreground/80'
              }
            />
          </View>

          <ScrollView
            horizontal={true}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            className={'px-6'}>
            <View
              className={
                'mr-4 flex flex-row items-center gap-2 rounded-md border border-border bg-gray-200 px-4 py-2'
              }>
              <Ionicons name={'file-tray-outline'} size={18} />
              <Text>Inbox</Text>
            </View>

            <Pressable
              onPress={() => handleDateButtonPress()}
              className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-2'}>
              <Ionicons name={'calendar-outline'} size={18} />
              <Text>Due Date</Text>
            </Pressable>

            <Pressable
              onPress={() => handlePriorityButtonPress()}
              className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-2'}>
              <Ionicons name={'flag-outline'} size={18} />
              <Text>Priority</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/task/label-select')}
              className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-2'}>
              <Ionicons name={'pricetag-outline'} size={18} />
              <Text>Label</Text>
            </Pressable>
          </ScrollView>
          <View className={'flex flex-row items-center justify-end border-border px-6 py-4 pb-0'}>
            <Button className={'rounded-full'} isIconOnly>
              <Button.Label>
                <Ionicons name={'checkmark-outline'} size={22} />
              </Button.Label>
            </Button>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
