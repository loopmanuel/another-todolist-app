import { View } from 'react-native';
import { Button } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function BackButton({ isClose = false }: { isClose?: boolean }) {
  const router = useRouter();

  return (
    <View className={'pl-4'}>
      <Button
        variant={'tertiary'}
        isIconOnly
        className={'items-center justify-center rounded-full'}
        onPress={() => router.back()}>
        <Button.Label className={'items-center justify-center'}>
          {isClose ? (
            <Ionicons name={'close-outline'} size={24} />
          ) : (
            <Ionicons name={'chevron-back-outline'} size={22} />
          )}
        </Button.Label>
      </Button>
    </View>
  );
}
