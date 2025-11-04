import { Text } from '@/components/ui/text';
import { TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'heroui-native';

export default function NewList() {
  return (
    <KeyboardAvoidingView className={'flex-1'}>
      <View className={'p-6 pb-0'}>
        <TextInput
          placeholder={'List name'}
          className={'w-full min-w-0 px-4 py-2 text-xl placeholder:text-muted-foreground/80'}
          autoFocus
        />
      </View>
      <View
        className={
          'mt-4 flex flex-row items-center justify-between border-t border-border px-6 py-4'
        }>
        <View className={'flex flex-row items-center'}>
          <View
            className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-4'}>
            <Ionicons name={'file-tray-outline'} size={18} />
            <Text>Icon</Text>
          </View>

          <View
            className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-4'}>
            <Ionicons name={'file-tray-outline'} size={18} />
            <Text>Color</Text>
          </View>
        </View>

        <Button className={'rounded-full'} isIconOnly>
          <Button.Label>
            <Ionicons name={'checkmark-outline'} size={22} />
          </Button.Label>
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
