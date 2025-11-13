import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';

export default function TestRoute() {
  const router = useRouter();
  return (
    <SafeAreaView className={'flex-1'}>
      <ScrollView contentInsetAdjustmentBehavior={'automatic'}>
        <Button onPress={() => router.push('/today')}>
          <Button.Label>New today</Button.Label>
        </Button>
        {Array.from({ length: 100 }).map((_, index) => (
          <Text key={index} style={{ paddingVertical: 4 }}>
            Item {index}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
