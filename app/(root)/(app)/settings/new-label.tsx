import { useCallback, useState } from 'react';
import { Keyboard, Pressable, TextInput, View } from 'react-native';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/auth-store';
import { useCreateLabelMutation } from '@/features/labels/mutations/use-create-label';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const LABEL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
];

export default function NewLabelModal() {
  const router = useRouter();
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const createLabelMutation = useCreateLabelMutation();

  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState(LABEL_COLORS[0]);

  const handleCreate = useCallback(async () => {
    if (!user?.id || !labelName.trim()) return;

    await createLabelMutation.mutateAsync({
      profileId: user.id,
      name: labelName,
      color: labelColor,
    });

    Keyboard.dismiss();
    router.back();
  }, [user?.id, labelName, labelColor, createLabelMutation, router]);

  const isCreating = createLabelMutation.isPending;

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled">
      <View className="mb-6">
        <Text className="text-foreground text-center text-lg font-semibold">Create Label</Text>
      </View>

      {/* Label Name Input */}
      <View className="mb-4">
        <Text className="text-muted-foreground mb-2 text-sm font-medium">Label Name</Text>
        <TextInput
          value={labelName}
          onChangeText={setLabelName}
          placeholder="Enter label name"
          placeholderTextColor="#9ca3af"
          className="border-border text-foreground rounded-lg border px-4 py-3"
          autoFocus
        />
      </View>

      {/* Color Picker */}
      <View className="mb-6">
        <Text className="text-muted-foreground mb-3 text-sm font-medium">Color</Text>
        <View className="flex-row flex-wrap gap-2">
          {LABEL_COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => setLabelColor(color)}
              className="size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: color }}>
              {labelColor === color && <Ionicons name="checkmark" size={20} color="white" />}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Preview */}
      <View className="border-border bg-surface mb-6 flex-row items-center gap-3 rounded-xl border px-4 py-3">
        <Ionicons name="pricetag" size={20} color={labelColor} />
        <Text className="text-foreground flex-1 text-base">{labelName || 'Label name'}</Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <Button
          className="flex-1"
          variant="secondary"
          onPress={() => router.back()}
          isDisabled={isCreating}>
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button
          className="flex-1"
          onPress={handleCreate}
          isDisabled={!labelName.trim() || isCreating}>
          <Button.Label>Create</Button.Label>
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}
