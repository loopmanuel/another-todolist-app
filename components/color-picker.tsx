import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { FC, useCallback, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, StyleSheet, View } from 'react-native';
import { COLORS } from '@/features/lists/utils/colors';

type Props = {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  selectedColor?: string | null;
  onSelectColor: (color: string) => void;
};

export const ColorPickerSheet: FC<Props> = ({
  isVisible,
  setIsVisible,
  selectedColor,
  onSelectColor,
}) => {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (isVisible) {
      ref.current?.expand();
    } else {
      ref.current?.close();
    }
  }, [isVisible]);

  const ref = useRef<BottomSheet>(null);

  // Backdrop strategy:
  // - Android: use library Backdrop with static opacity for performance (no live blur support)
  // - iOS: custom Backdrop animates BlurView intensity with Reanimated for native-feel depth
  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    );
  }, []);

  const handleColorSelect = (color: string) => {
    onSelectColor(color);
    setIsVisible(false);
  };

  return (
    <BottomSheet
      ref={ref}
      // Start hidden so first open animates from -1 → 0 (drives backdrop interpolation)
      index={-1}
      enablePanDownToClose
      // Custom render controls platform-specific backdrop animation shape
      backdropComponent={renderBackdrop}
      handleStyle={styles.handleStyle}
      backgroundStyle={styles.backgroundStyle}
      // Keep source of truth outside to prevent tearing when the sheet closes via gesture
      onClose={() => setIsVisible(false)}
      detached
      bottomInset={insets.bottom + 12}
      snapPoints={['50%']}
      enableDynamicSizing={false}>
      <BottomSheetView>
        <View className="mt-2 h-[6px] w-[45] self-center rounded-full bg-white/30" />

        <View className="px-6 py-6">
          <View className="flex-row flex-wrap gap-3">
            {COLORS.map((color) => (
              <Pressable
                key={color.value}
                onPress={() => handleColorSelect(color.value || COLORS[0].value!)}
                className="items-center justify-center"
                style={{ width: '17%' }}>
                <View
                  style={{
                    backgroundColor: color.value || COLORS[0].value!,
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: selectedColor === color.value ? 3 : 0,
                    borderColor: '#000',
                  }}
                />
              </Pressable>
            ))}
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  handleStyle: {
    display: 'none',
  },
  backgroundStyle: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(64, 64, 64, 0.5)',
    borderCurve: 'continuous',
  },
});
