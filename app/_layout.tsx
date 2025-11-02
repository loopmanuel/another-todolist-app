import '../global.css';

import { Slot } from 'expo-router';
import { HeroUINativeProvider } from 'heroui-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
export default function Layout() {
  return (
    <KeyboardProvider>
      <HeroUINativeProvider>
        <Slot />
      </HeroUINativeProvider>
    </KeyboardProvider>
  );
}
