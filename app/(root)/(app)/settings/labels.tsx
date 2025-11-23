import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Button, Card } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/auth-store';
import { useLabelsQuery } from '@/features/labels/queries/use-labels';
import { useCreateLabelMutation } from '@/features/labels/mutations/use-create-label';
import { useUpdateLabelMutation } from '@/features/labels/mutations/use-update-label';
import { useDeleteLabelMutation } from '@/features/labels/mutations/use-delete-label';

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

export default function LabelsSettings() {
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { data: labels = [], isLoading } = useLabelsQuery({ userId: user?.id });
  const createLabelMutation = useCreateLabelMutation();
  const updateLabelMutation = useUpdateLabelMutation();
  const deleteLabelMutation = useDeleteLabelMutation();

  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelName, setEditingLabelName] = useState('');
  const [editingLabelColor, setEditingLabelColor] = useState('');

  const handleCreateLabel = async () => {
    if (!user?.id || !newLabelName.trim()) return;

    await createLabelMutation.mutateAsync({
      profileId: user.id,
      name: newLabelName,
      color: newLabelColor,
    });

    setNewLabelName('');
    setNewLabelColor(LABEL_COLORS[0]);
  };

  const handleStartEdit = (labelId: string, name: string, color: string | null) => {
    setEditingLabelId(labelId);
    setEditingLabelName(name);
    setEditingLabelColor(color || LABEL_COLORS[0]);
  };

  const handleCancelEdit = () => {
    setEditingLabelId(null);
    setEditingLabelName('');
    setEditingLabelColor('');
  };

  const handleUpdateLabel = async (labelId: string) => {
    if (!user?.id || !editingLabelName.trim()) return;

    await updateLabelMutation.mutateAsync({
      id: labelId,
      profileId: user.id,
      name: editingLabelName,
      color: editingLabelColor,
    });

    handleCancelEdit();
  };

  const handleDeleteLabel = (labelId: string, labelName: string) => {
    if (!user?.id) return;

    Alert.alert('Delete Label', `Are you sure you want to delete "${labelName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteLabelMutation.mutate({
            id: labelId,
            profileId: user.id,
          });
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="px-6 py-6">
        {/* Create New Label Card */}
        <Card className="mb-6">
          <Card.Body className="p-4">
            <Text className="text-foreground mb-3 text-base font-semibold">Create New Label</Text>
            <View className="gap-3">
              <TextInput
                placeholder="Label name"
                value={newLabelName}
                onChangeText={setNewLabelName}
                className="border-border text-foreground rounded-lg border px-3 py-2"
              />

              {/* Color Picker */}
              <View className="gap-2">
                <Text className="text-muted-foreground text-sm">Color</Text>
                <View className="flex-row flex-wrap gap-2">
                  {LABEL_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setNewLabelColor(color)}
                      className="size-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: color }}>
                      {newLabelColor === color && (
                        <Ionicons name="checkmark" size={20} color="white" />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              <Button
                onPress={handleCreateLabel}
                isDisabled={!newLabelName.trim() || createLabelMutation.isPending}>
                <Button.Label>Create Label</Button.Label>
              </Button>
            </View>
          </Card.Body>
        </Card>

        {/* Existing Labels */}
        <Text className="text-foreground mb-3 text-lg font-semibold">Your Labels</Text>

        {labels.length === 0 ? (
          <View className="border-border rounded-2xl border border-dashed p-6">
            <Text className="text-muted-foreground text-center text-base">
              No labels yet. Create your first label above!
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {labels.map((label) => (
              <Card key={label.id}>
                <Card.Body className="p-4">
                  {editingLabelId === label.id ? (
                    // Edit Mode
                    <View className="gap-3">
                      <TextInput
                        placeholder="Label name"
                        value={editingLabelName}
                        onChangeText={setEditingLabelName}
                        className="border-border text-foreground rounded-lg border px-3 py-2"
                      />

                      {/* Color Picker */}
                      <View className="gap-2">
                        <Text className="text-muted-foreground text-sm">Color</Text>
                        <View className="flex-row flex-wrap gap-2">
                          {LABEL_COLORS.map((color) => (
                            <Pressable
                              key={color}
                              onPress={() => setEditingLabelColor(color)}
                              className="size-10 items-center justify-center rounded-full"
                              style={{ backgroundColor: color }}>
                              {editingLabelColor === color && (
                                <Ionicons name="checkmark" size={20} color="white" />
                              )}
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      <View className="flex-row gap-2">
                        <Button
                          className="flex-1"
                          variant="secondary"
                          onPress={handleCancelEdit}>
                          <Button.Label>Cancel</Button.Label>
                        </Button>
                        <Button
                          className="flex-1"
                          onPress={() => handleUpdateLabel(label.id)}
                          isDisabled={!editingLabelName.trim() || updateLabelMutation.isPending}>
                          <Button.Label>Save</Button.Label>
                        </Button>
                      </View>
                    </View>
                  ) : (
                    // View Mode
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 flex-row items-center gap-3">
                        <View
                          className="size-6 rounded-full"
                          style={{ backgroundColor: label.color || '#9ca3af' }}
                        />
                        <Text className="text-foreground flex-1 text-base font-medium">
                          {label.name}
                        </Text>
                      </View>
                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() =>
                            handleStartEdit(label.id, label.name, label.color)
                          }
                          className="size-9 items-center justify-center rounded-lg bg-blue-50">
                          <Ionicons name="pencil" size={18} color="#3b82f6" />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDeleteLabel(label.id, label.name)}
                          className="size-9 items-center justify-center rounded-lg bg-red-50">
                          <Ionicons name="trash" size={18} color="#ef4444" />
                        </Pressable>
                      </View>
                    </View>
                  )}
                </Card.Body>
              </Card>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
