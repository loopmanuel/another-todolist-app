import { Alert, Pressable, ScrollView, View } from 'react-native';
import { Button, Card, useThemeColor } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();
  const dangerColor = useThemeColor('danger');

  const { signOut, user } = useAuthStore((state) => ({
    signOut: state.signOut,
    user: state.user,
  }));

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Sign out failed', error);
    }
  };

  return (
    <ScrollView className={'pb-safe flex-1'}>
      <View className={'px-6 pt-6'}>
        {/* Labels Card */}
        <Pressable onPress={() => router.push('/settings/labels')}>
          <Card className={'mb-4'}>
            <Card.Body className={'flex-row items-center justify-between p-4'}>
              <View className={'flex-row items-center gap-3'}>
                <View className={'size-10 items-center justify-center rounded-full bg-purple-100'}>
                  <Ionicons name={'pricetag'} size={20} color={'#a855f7'} />
                </View>
                <View>
                  <Text className={'text-foreground text-base font-semibold'}>Labels</Text>
                  <Text className={'text-muted-foreground text-sm'}>
                    Manage your task labels
                  </Text>
                </View>
              </View>
              <Ionicons name={'chevron-forward'} size={20} color={'#9ca3af'} />
            </Card.Body>
          </Card>
        </Pressable>

        {/* Sign Out Button */}
        <Button variant={'destructive-soft'} onPress={() => handleSignOut()}>
          <Ionicons name={'log-out-outline'} size={20} color={dangerColor} />
          <Button.Label>Logout</Button.Label>
        </Button>
      </View>
    </ScrollView>
  );
}
