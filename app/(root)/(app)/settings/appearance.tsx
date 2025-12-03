import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useThemeColor } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useAppTheme } from '@/contexts/app-theme-contexts';

type ThemeOption = {
  id: string;
  name: string;
  lightVariant: string;
  darkVariant: string;
  colors: { primary: string; secondary: string; tertiary: string };
};

const availableThemes: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
    lightVariant: 'light',
    darkVariant: 'dark',
    colors: {
      primary: '#006FEE',
      secondary: '#17C964',
      tertiary: '#F5A524',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    lightVariant: 'lavender-light',
    darkVariant: 'lavender-dark',
    colors: {
      primary: 'hsl(270 50% 75%)',
      secondary: 'hsl(160 40% 70%)',
      tertiary: 'hsl(45 55% 75%)',
    },
  },
  {
    id: 'mint',
    name: 'Mint',
    lightVariant: 'mint-light',
    darkVariant: 'mint-dark',
    colors: {
      primary: 'hsl(165 45% 70%)',
      secondary: 'hsl(145 50% 68%)',
      tertiary: 'hsl(55 60% 75%)',
    },
  },
  {
    id: 'sky',
    name: 'Sky',
    lightVariant: 'sky-light',
    darkVariant: 'sky-dark',
    colors: {
      primary: 'hsl(200 50% 72%)',
      secondary: 'hsl(175 45% 70%)',
      tertiary: 'hsl(48 58% 75%)',
    },
  },
];

const ThemeCard: React.FC<{
  theme: ThemeOption;
  isActive: boolean;
  onPress: () => void;
}> = ({ theme, isActive, onPress }) => {
  const borderColor = useThemeColor('border');
  const accentColor = useThemeColor('accent');

  return (
    <Pressable
      onPress={onPress}
      className="border-border bg-surface rounded-xl border p-4"
      style={{
        borderColor: isActive ? accentColor : borderColor,
        borderWidth: isActive ? 2 : 1,
      }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {/* Theme preview circle */}
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              overflow: 'hidden',
              position: 'relative',
            }}>
            {/* Primary color - 50% */}
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: theme.colors.primary,
              }}
            />
            {/* Secondary color - 25% */}
            <View
              style={{
                position: 'absolute',
                width: '100%',
                height: '50%',
                backgroundColor: theme.colors.secondary,
                bottom: 0,
              }}
            />
            {/* Tertiary color - 25% */}
            <View
              style={{
                position: 'absolute',
                width: '50%',
                height: '50%',
                backgroundColor: theme.colors.tertiary,
                bottom: 0,
                right: 0,
              }}
            />
          </View>

          {/* Theme name */}
          <Text className="text-foreground text-base font-medium">{theme.name}</Text>
        </View>

        {/* Checkmark if active */}
        {isActive && (
          <View className="bg-accent h-6 w-6 items-center justify-center rounded-full">
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default function AppearanceSettings() {
  const { currentTheme, setTheme, isLight, toggleTheme } = useAppTheme();

  const getCurrentThemeId = () => {
    if (currentTheme === 'light' || currentTheme === 'dark') return 'default';
    if (currentTheme.startsWith('lavender')) return 'lavender';
    if (currentTheme.startsWith('mint')) return 'mint';
    if (currentTheme.startsWith('sky')) return 'sky';
    return 'default';
  };

  const handleThemeSelect = (theme: ThemeOption) => {
    const variant = isLight ? theme.lightVariant : theme.darkVariant;
    setTheme(variant as any);
  };

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="px-6 py-6">
        {/* Color Mode Section */}
        <View className="mb-8">
          <Text className="text-muted-foreground mb-3 text-xs font-semibold uppercase">
            Color Mode
          </Text>
          <Pressable
            onPress={toggleTheme}
            className="border-border bg-surface flex-row items-center justify-between rounded-xl border px-4 py-3">
            <View className="flex-row items-center gap-3">
              <Ionicons
                name={isLight ? 'sunny' : 'moon'}
                size={20}
                color={isLight ? '#f59e0b' : '#6366f1'}
              />
              <Text className="text-foreground text-base font-medium">
                {isLight ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
          </Pressable>
        </View>

        {/* Color Schema Section */}
        <View>
          <Text className="text-muted-foreground mb-3 text-xs font-semibold uppercase">
            Color Schema
          </Text>
          <View className="gap-3">
            {availableThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isActive={getCurrentThemeId() === theme.id}
                onPress={() => handleThemeSelect(theme)}
              />
            ))}
          </View>
        </View>

        {/* Info Section */}
        <View className="border-border bg-surface mt-8 rounded-xl border p-4">
          <View className="mb-2 flex-row items-center gap-2">
            <Ionicons name="information-circle" size={20} color="#6366f1" />
            <Text className="text-foreground text-sm font-semibold">About Themes</Text>
          </View>
          <Text className="text-muted-foreground text-sm leading-5">
            Choose your preferred color schema. Each theme adapts to both light and dark modes.
            Your selection will be saved and applied across the app.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
