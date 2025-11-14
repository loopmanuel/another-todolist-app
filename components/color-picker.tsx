import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { FC, useCallback, useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';

type Props = {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
};

export const ColorPickerSheet: FC<Props> = ({ isVisible, setIsVisible }) => {
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

        <View className={'bg-white'}>
          {Array.from({ length: 100 }).map((_, index) => (
            <Text key={index} style={{ paddingVertical: 4 }}>
              Item {index}
            </Text>
          ))}
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
    backgroundColor: '#ffaeae',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(64, 64, 64, 0.5)',
    borderCurve: 'continuous',
  },
});
