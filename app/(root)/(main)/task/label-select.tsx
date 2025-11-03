import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export default function LabelSelect() {
  return (
    <KeyboardAwareScrollView className={'flex-1'}>
      <View className={'p-6'}>
        <Text>test</Text>
      </View>
    </KeyboardAwareScrollView>
  );
}
