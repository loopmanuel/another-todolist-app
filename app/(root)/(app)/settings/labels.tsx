import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/store/auth-store';
import { useLabelsQuery } from '@/features/labels/queries/use-labels';

export default function LabelsSettings() {
  const router = useRouter();
  const { user } = useAuthStore((state) => ({ user: state.user }));
  const { data: labels = [], isLoading } = useLabelsQuery({ userId: user?.id });

  const handleEditLabel = (labelId: string) => {
    router.push(`/settings/edit-label?id=${labelId}`);
  };

  const handleCreateLabel = () => {
    router.push('/settings/new-label');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="px-6 py-6">
          {labels.length === 0 ? (
            <View className="border-border rounded-xl border border-dashed p-8">
              <Text className="text-muted-foreground text-center text-sm">
                No labels yet. Create your first label!
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {labels.map((label) => (
                <Pressable
                  key={label.id}
                  onPress={() => handleEditLabel(label.id)}
                  className="border-border bg-surface flex-row items-center justify-between rounded-xl border px-3 py-2.5">
                  <View className="flex-1 flex-row items-center gap-3">
                    <Ionicons name="pricetag" size={18} color={label.color || '#9ca3af'} />
                    <Text className="text-foreground flex-1 text-base">{label.name}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4">
        <Button onPress={handleCreateLabel} size="lg" className="w-full">
          <Ionicons name="add" size={20} />
          <Button.Label>Create Label</Button.Label>
        </Button>
      </View>
    </View>
  );
}
