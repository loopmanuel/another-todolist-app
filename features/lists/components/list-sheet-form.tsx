import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorPickerSheet } from '@/components/color-picker';
import { useMaxKeyboardHeight } from '@/lib/hooks/use-max-keyboard-height';
import { KeyboardController, useKeyboardState } from 'react-native-keyboard-controller';
import { useCreateListMutation } from '@/features/lists/mutations/use-create-list';
import { useUpdateListMutation } from '@/features/lists/mutations/use-update-list';
import { useListQuery } from '@/features/lists/queries/use-list';
import { useAuthStore } from '@/store/auth-store';
import { COLORS } from '@/features/lists/utils/colors';
import EmojiPicker, { type EmojiType } from 'rn-emoji-keyboard';
import { ActivityIndicator } from 'react-native';

type ListSheetFormProps = {
  listId?: string;
  onDismiss: () => void;
};

export function ListSheetForm({ listId, onDismiss }: ListSheetFormProps) {
  const user = useAuthStore((state) => state.user);
  const isEditMode = Boolean(listId);

  const { data: existingList, isLoading: listLoading } = useListQuery(listId);
  const createListMutation = useCreateListMutation();
  const updateListMutation = useUpdateListMutation();

  const sheetRef = useRef<BottomSheetModal>(null);

  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  // Dynamic offset for KeyboardStickyView: when modal opens, this freezes the text input
  // at its current keyboard-elevated position, preventing visual jump
  const [keyboardOffsetClosed, setKeyboardOffsetClosed] = useState(0);
  const [listName, setListName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].value!);
  const [selectedIcon, setSelectedIcon] = useState<string>('📋');
  const textInputRef = useRef<TextInput>(null);

  const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState<boolean>(false);

  const insets = useSafeAreaInsets();

  // Maximum keyboard height across all device configurations - used to calculate
  // the exact offset needed to freeze text input position when modal opens
  const maxKeyboardHeight = useMaxKeyboardHeight();

  const isKeyboardVisible = useKeyboardState((state) => state.isVisible);

  // Initialize form with existing list data when in edit mode
  useEffect(() => {
    if (isEditMode && existingList && !listLoading) {
      setListName(existingList.name);
      setSelectedColor(existingList.color || COLORS[0].value!);
      setSelectedIcon(existingList.icon || '📋');
    }
  }, [isEditMode, existingList, listLoading]);

  // Restores text input focus after modal closes
  // When modal was opened while text input was focused, this effect restores keyboard focus
  // to maintain user's interaction context. setFocusTo("current") ensures the previously
  // focused input regains focus, and isTextInputFocused flag is reset to prevent re-triggering
  useEffect(() => {
    if (!isColorPickerOpen && isTextInputFocused) {
      KeyboardController.setFocusTo('current');
      setIsTextInputFocused(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isColorPickerOpen]);

  // Resets keyboard offset when all conditions are cleared
  // After modal closes and keyboard dismisses, this clears the frozen position offset
  // that was applied to prevent visual jump. 200ms delay ensures keyboard animation
  // completes before resetting offset, preventing visual glitches during transition
  useEffect(() => {
    if (!isKeyboardVisible && !isColorPickerOpen && !isTextInputFocused) {
      setTimeout(() => {
        setKeyboardOffsetClosed(0);
      }, 200);
    }
  }, [isKeyboardVisible, isColorPickerOpen, isTextInputFocused]);

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    );
  }, []);

  const handleDismiss = () => {
    Keyboard.dismiss();
    onDismiss();
  };

  const handleEmojiPick = (emojiObject: EmojiType) => {
    setSelectedIcon(emojiObject.emoji);
  };

  const handleSubmit = async () => {
    if (!listName.trim() || !user?.id) {
      return;
    }

    try {
      if (isEditMode && listId) {
        await updateListMutation.mutateAsync({
          listId,
          ownerId: user.id,
          name: listName,
          color: selectedColor,
          icon: selectedIcon,
        });
      } else {
        await createListMutation.mutateAsync({
          name: listName,
          color: selectedColor,
          icon: selectedIcon,
          ownerId: user.id,
        });
      }

      // Close the sheet and navigate back
      handleDismiss();
    } catch (error) {
      // Handle error (you might want to show a toast or alert)
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} list:`, error);
    }
  };

  const isPending = createListMutation.isPending || updateListMutation.isPending;

  // Show loading state while fetching list data in edit mode
  if (isEditMode && listLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <EmojiPicker
        onEmojiSelected={handleEmojiPick}
        open={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
      />

      <BottomSheet
        ref={sheetRef}
        index={0}
        // Start hidden so first open animates from -1 → 0 (drives backdrop interpolation)
        enablePanDownToClose
        // Custom render controls platform-specific backdrop animation shape
        backdropComponent={renderBackdrop}
        handleStyle={styles.handleStyle}
        backgroundStyle={styles.backgroundStyle}
        // Keep source of truth outside to prevent tearing when the sheet closes via gesture
        onClose={handleDismiss}
        keyboardBehavior={'interactive'}
        keyboardBlurBehavior={'restore'}
        detached
        bottomInset={insets.bottom + 12}>
        <BottomSheetView
          style={{
            paddingBottom: maxKeyboardHeight + 16,
          }}>
          <View className="mt-2 h-[6px] w-[45] self-center rounded-full bg-white/30" />

          {/* Header with Cancel and Save buttons */}
          <View className="flex-row items-center justify-between px-6 pb-4 pt-3">
            <Pressable onPress={handleDismiss} className="rounded-lg px-3 py-2">
              <Text className="text-base font-medium text-gray-600">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={!listName.trim() || isPending}
              className="rounded-lg bg-blue-500 px-4 py-2 disabled:opacity-50">
              <Text className="text-base font-semibold text-white">
                {isPending ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>

          <View className="px-9 pb-5">
            <TextInput
              ref={textInputRef}
              autoFocus
              placeholder={'Enter list name'}
              value={listName}
              onChangeText={setListName}
              onSubmitEditing={handleSubmit}
              returnKeyType="done"
              className={
                'placeholder:text-muted-foreground/80 mt-6 w-full min-w-0 px-0 py-2 text-2xl font-semibold'
              }
            />

            <View className="mt-4 flex-row items-center gap-3">
              <Pressable
                onPress={() => {
                  setIsEmojiPickerOpen(true);
                }}
                className="flex-row items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2">
                <Text className="text-xl">{selectedIcon}</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (textInputRef.current?.isFocused()) {
                    setIsTextInputFocused(true);
                    setKeyboardOffsetClosed(
                      -maxKeyboardHeight + insets.bottom - (Platform.OS === 'android' ? 60 : 10)
                    );

                    setTimeout(() => KeyboardController.dismiss(), 200);
                  }

                  setIsColorPickerOpen(true);
                }}
                className="flex-row items-center gap-2">
                <View
                  style={{
                    backgroundColor: selectedColor,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  }}
                />
              </Pressable>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <ColorPickerSheet
        isVisible={isColorPickerOpen}
        setIsVisible={setIsColorPickerOpen}
        selectedColor={selectedColor}
        onSelectColor={setSelectedColor}
      />
    </>
  );
}

const styles = StyleSheet.create({
  handleStyle: {
    display: 'none',
  },
  backgroundStyle: {
    marginHorizontal: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 24,
    borderColor: 'rgba(64, 64, 64, 0.5)',
    borderCurve: 'continuous',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
