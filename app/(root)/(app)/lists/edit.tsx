import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ListSheetForm } from '@/features/lists/components/list-sheet-form';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ListForm } from '@/features/lists/components/list-form';
import { useRef } from 'react';

export default function EditList() {
  const router = useRouter();
  const submitRef = useRef<(() => void) | null>(null);

  const params = useLocalSearchParams<{ list_id?: string }>();
  const listId = Array.isArray(params.list_id) ? params.list_id[0] : params.list_id;

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
      <ListForm listId={listId} onSubmitRef={submitRef} />
    </>
  );
}
