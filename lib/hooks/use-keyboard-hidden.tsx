import { useState } from 'react';
import {
  KeyboardController,
  KeyboardStickyView,
  useKeyboardState,
} from 'react-native-keyboard-controller';
import { useMaxKeyboardHeight } from '@/lib/hooks/use-max-keyboard-height';

export default function useKeyboardHidden() {
  const [keyboardOffsetClosed, setKeyboardOffsetClosed] = useState(0);

  const maxKeyboardHeight = useMaxKeyboardHeight();

  const isKeyboardVisible = useKeyboardState((state) => state.isVisible);

  return {};
}
