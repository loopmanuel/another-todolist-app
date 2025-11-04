
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';

export default function DatePicker() {
  const router = useRouter();

  return (
    <View className={'pb-safe'}>
      <View className={'p-6'}>
        <Button onPress={() => router.back()}>
          <Button.Label>Back</Button.Label>
        </Button>

        <Text>Date Picker</Text>
      </View>
    </View>
  );
}
