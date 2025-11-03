import { View } from 'react-native';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function BackButton() {
  const router = useRouter();

  return (
    <View className={'pl-4'}>
      <Button
        variant={'tertiary'}
        isIconOnly
        className={'rounded-full'}
        onPress={() => router.back()}>
        <Button.Label>
          <Ionicons name={'settings-outline'} size={22} />
        </Button.Label>
      </Button>
    </View>
  );
}
