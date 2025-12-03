import { useCallback, useState } from 'react';
import { Keyboard, Pressable, TextInput, View } from 'react-native';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/auth-store';
import { useUpdateLabelMutation } from '@/features/labels/mutations/use-update-label';
import { useDeleteLabelMutation } from '@/features/labels/mutations/use-delete-label';
import { useLabelsQuery } from '@/features/labels/queries/use-labels';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Alert } from 'react-native';

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

export default function EditLabelModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore((state) => ({ user: state.user }));

  // Get the label from the query
  const { data: labels = [] } = useLabelsQuery({ userId: user?.id });
  const label = labels.find((l) => l.id === id);

  const [editedName, setEditedName] = useState(label?.name || '');
  const [editedColor, setEditedColor] = useState(label?.color || LABEL_COLORS[0]);

  const updateLabelMutation = useUpdateLabelMutation();
  const deleteLabelMutation = useDeleteLabelMutation();

  const handleSave = useCallback(async () => {
    if (!user?.id || !label || !editedName.trim()) return;

    await updateLabelMutation.mutateAsync({
      id: label.id,
      profileId: user.id,
      name: editedName,
      color: editedColor,
    });

    Keyboard.dismiss();
    router.back();
  }, [user?.id, label, editedName, editedColor, updateLabelMutation, router]);

  const handleDelete = useCallback(() => {
    if (!user?.id || !label) return;

    Alert.alert('Delete Label', `Are you sure you want to delete "${label.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLabelMutation.mutateAsync({
            id: label.id,
            profileId: user.id,
          });
          router.back();
        },
      },
    ]);
  }, [user?.id, label, deleteLabelMutation, router]);

  if (!label) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted-foreground">Label not found</Text>
      </View>
    );
  }

  const isSaving = updateLabelMutation.isPending || deleteLabelMutation.isPending;

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled">
      <View className="mb-6">
        <Text className="text-foreground text-center text-lg font-semibold">Edit Label</Text>
      </View>

      {/* Label Name Input */}
      <View className="mb-4">
        <Text className="text-muted-foreground mb-2 text-sm font-medium">Label Name</Text>
        <TextInput
          value={editedName}
          onChangeText={setEditedName}
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
              onPress={() => setEditedColor(color)}
              className="size-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: color }}>
              {editedColor === color && <Ionicons name="checkmark" size={20} color="white" />}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Preview */}
      <View className="border-border bg-surface mb-6 flex-row items-center gap-3 rounded-xl border px-4 py-3">
        <Ionicons name="pricetag" size={20} color={editedColor} />
        <Text className="text-foreground flex-1 text-base">{editedName || 'Label name'}</Text>
      </View>

      {/* Action Buttons */}
      <View className="gap-3">
        <View className="flex-row gap-3">
          <Button
            className="flex-1"
            variant="secondary"
            onPress={() => router.back()}
            isDisabled={isSaving}>
            <Button.Label>Cancel</Button.Label>
          </Button>
          <Button
            className="flex-1"
            onPress={handleSave}
            isDisabled={!editedName.trim() || isSaving}>
            <Button.Label>Save</Button.Label>
          </Button>
        </View>
        <Button variant="destructive-soft" onPress={handleDelete} isDisabled={isSaving}>
          <Ionicons name="trash-outline" size={18} />
          <Button.Label>Delete Label</Button.Label>
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}
