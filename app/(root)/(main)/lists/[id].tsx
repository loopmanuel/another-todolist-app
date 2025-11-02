import { Text } from '@/components/ui/text';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListDetails() {
  return (
    <ScrollView className={'flex-1 pt-6'}>
      <Text>This is a test</Text>
      <Text>This is a test</Text>
      <Text>This is a test</Text>
      <Text>This is a test</Text>
      <Text>This is a test</Text>
      <Text>This is a test</Text>
      <Text>This is a test</Text>
      <Text>This is a test</Text>
      <Text>This is a test</Text>
      <Text>This is a test</Text>
    </ScrollView>
  );
}
