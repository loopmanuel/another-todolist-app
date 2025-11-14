import { ListForm } from '@/features/lists/components/list-form';
import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ColorPickerSheet } from '@/components/color-picker';
import { useMaxKeyboardHeight } from '@/lib/hooks/use-max-keyboard-height';
import {
  KeyboardAvoidingView,
  KeyboardController,
  KeyboardStickyView,
  useKeyboardState,
} from 'react-native-keyboard-controller';

export default function NewList() {
  const router = useRouter();

  const sheetRef = useRef<BottomSheetModal>(null);

  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  // Dynamic offset for KeyboardStickyView: when modal opens, this freezes the text input
  // at its current keyboard-elevated position, preventing visual jump
  const [keyboardOffsetClosed, setKeyboardOffsetClosed] = useState(0);
  const [value, setValue] = useState('');
  const textInputRef = useRef<TextInput>(null);

  const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false);

  const insets = useSafeAreaInsets();

  // Maximum keyboard height across all device configurations - used to calculate
  // the exact offset needed to freeze text input position when modal opens
  const maxKeyboardHeight = useMaxKeyboardHeight();

  const isKeyboardVisible = useKeyboardState((state) => state.isVisible);

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
    // go back to whatever screen was underneath
    router.back();
  };

  return (
    <>
      <BottomSheet
        ref={sheetRef}
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

          <View className="px-9 pb-5">
            <TextInput
              ref={textInputRef}
              placeholder={'Enter list name'}
              autoFocus
              className={
                'placeholder:text-muted-foreground/80 mt-6 w-full min-w-0 px-0 py-2 text-2xl font-semibold'
              }
            />

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
              }}>
              <Text>Open Color picker</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheet>

      <ColorPickerSheet isVisible={isColorPickerOpen} setIsVisible={setIsColorPickerOpen} />
    </>
  );
}

const styles = StyleSheet.create({
  handleStyle: {
    display: 'none',
  },
  backgroundStyle: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 24,
    borderColor: 'rgba(64, 64, 64, 0.5)',
    borderCurve: 'continuous',
  },
});
