import { Alert, ScrollView, View } from 'react-native';
import { Accordion, Button, useThemeColor } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/auth-store';
import { Text } from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { StyledIcon } from '@/components/styled-icon';
import { settingsNavigation } from '@/lib/constants/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Settings() {
  const router = useRouter();

  const inset = useSafeAreaInsets();

  const dangerColor = useThemeColor('danger');

  const { signOut, user } = useAuthStore((state) => ({
    signOut: state.signOut,
    user: state.user,
  }));

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      Alert.alert('Sign out failed', error);
    }
  };

  return (
    <ScrollView className={'flex-1'} style={{ paddingTop: inset.top + 60 }}>
      <View className={'px-6 pt-6'}>
        {settingsNavigation.map((section) => (
          <View key={section.id} className={'mb-4'}>
            {section.title && (
              <Text className={'mx-2 mb-3 text-xs font-semibold uppercase text-gray-500'}>
                {section.title}
              </Text>
            )}
            <Accordion isCollapsible={false} variant="surface">
              {section.routes.map((route) => (
                <Accordion.Item key={route.id} value={route.id} isDisabled={route.disabled}>
                  <Accordion.Trigger
                    onPress={() => {
                      if (route.route) {
                        router.push(route.route);
                      } else if (route.onPress) {
                        route.onPress();
                      }
                    }}>
                    <View className={'flex-row items-center gap-3'}>
                      <Ionicons name={route.icon} size={20} color={route.iconColor || '#9ca3af'} />
                      <View className={'flex-1'}>
                        <Text className={'text-base font-medium'}>{route.title}</Text>
                        {route.description && (
                          <Text className={'text-muted-foreground text-sm'}>
                            {route.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    {!route.disabled && (
                      <Accordion.Indicator>
                        <StyledIcon name="chevron-forward" size={16} className="text-muted" />
                      </Accordion.Indicator>
                    )}
                  </Accordion.Trigger>
                </Accordion.Item>
              ))}
            </Accordion>
          </View>
        ))}

        {/* Sign Out Button */}
        <Button variant={'destructive-soft'} onPress={() => handleSignOut()}>
          <Ionicons name={'log-out-outline'} size={20} color={dangerColor} />
          <Button.Label>Logout</Button.Label>
        </Button>
      </View>

      <View style={{ paddingBottom: inset.bottom, paddingTop: inset.top }} />
    </ScrollView>
  );
}
