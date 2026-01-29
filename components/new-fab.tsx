import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from 'heroui-native';
import React from 'react';

export default function NewFab() {
  const router = useRouter();

  const insets = useSafeAreaInsets();

  return (
    <View
      className={'absolute left-0 mx-6 flex w-full flex-1 flex-row items-center justify-between'}
      style={{
        bottom: 32 + insets.bottom,
        zIndex: 20,
        elevation: 20,
      }}>
      <Button size={'sm'} variant={'tertiary'} onPress={() => router.push('/lists/new')}>
        <Ionicons name={'add-circle-outline'} size={24} />
        <Button.Label>New List</Button.Label>
      </Button>

      <Button isIconOnly size={'lg'} onPress={() => router.push('/task/new')}>
        <Ionicons name={'add-outline'} size={28} color={'#fff'} />
      </Button>
    </View>
  );
}
