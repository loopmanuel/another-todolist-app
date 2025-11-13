import { Alert, ScrollView, Text, View } from 'react-native';
import { Button, useThemeColor } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';

export default function Settings() {
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
      <View className={'pt-safe'}>
        <Text>Test</Text>
      </View>

      <View className={'px-6'}>
        <Button variant={'destructive-soft'} onPress={() => handleSignOut()}>
          <Ionicons name={'log-out-outline'} size={20} color={dangerColor} />
          <Button.Label>Logout</Button.Label>
        </Button>
      </View>
    </ScrollView>
  );
}
