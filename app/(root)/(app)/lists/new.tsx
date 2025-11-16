import { useRef } from 'react';
import { Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ListForm } from '@/features/lists/components/list-form';

export default function NewList() {
  const router = useRouter();
  const submitRef = useRef<(() => void) | null>(null);

  const handleSubmit = () => {
    if (submitRef.current) {
      submitRef.current();
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerLeft: () => (
            <Pressable className="px-2" onPress={() => router.back()}>
              <Ionicons name="close-outline" size={24} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable className="px-2" onPress={handleSubmit}>
              <Ionicons name="checkmark-outline" size={24} />
            </Pressable>
          ),
        }}
      />
      <ListForm onSubmitRef={submitRef} />
    </>
  );
}
