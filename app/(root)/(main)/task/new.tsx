import { Text } from '@/components/ui/text';
import { ScrollView, View, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Button, Select } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';

export default function NewTask() {
  return (
    <KeyboardAwareScrollView>
      <View className={'p-6 pb-0'}>
        <TextInput
          placeholder={'Task name'}
          className={'w-full min-w-0 px-0 py-2 text-xl placeholder:text-muted-foreground/80'}
          autoFocus
        />
      </View>

      <View className={'p-6 pt-0'}>
        <TextInput
          placeholder={'Description'}
          className={'w-full min-w-0 px-0 py-2 text-base placeholder:text-muted-foreground/80'}
        />
      </View>

      <ScrollView horizontal={true} className={'px-6'}>
        <View className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-2'}>
          <Ionicons name={'calendar-outline'} size={18} />
          <Text>Due Date</Text>
        </View>

        <View className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-2'}>
          <Ionicons name={'flag-outline'} size={18} />
          <Text>Priority</Text>
        </View>

        <Select>
          <Select.Trigger>
            <View
              className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-2'}>
              <Ionicons name={'pricetag-outline'} size={18} />
              <Text>Label</Text>
            </View>
          </Select.Trigger>
          <Select.Portal>
            <Select.Overlay />
            <Select.Content presentation="bottom-sheet" snapPoints={['35%']}>
              <Select.Item value="1" label="Item 1" />
              <Select.Item value="2" label="Item 2" />
            </Select.Content>
          </Select.Portal>
        </Select>
      </ScrollView>

      <View
        className={
          'mt-4 flex flex-row items-center justify-between border-t border-border px-6 py-4'
        }>
        <View className={'mr-4 flex flex-row items-center gap-2 rounded-md bg-gray-200 px-4 py-2'}>
          <Ionicons name={'file-tray-outline'} size={18} />
          <Text>Inbox</Text>
        </View>

        <Button className={'rounded-full'} isIconOnly>
          <Button.Label>
            <Ionicons name={'checkmark-outline'} size={22} />
          </Button.Label>
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
}
