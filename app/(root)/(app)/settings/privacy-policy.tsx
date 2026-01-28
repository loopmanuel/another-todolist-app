import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';

const lastUpdated = 'January 28, 2026';

const sections = [
  {
    title: 'Overview',
    body: [
      'This Privacy Policy explains how we collect, use, and protect your information when you use the app.',
      'By using the app, you agree to the practices described here.',
    ],
  },
  {
    title: 'Information We Collect',
    body: [
      'Account information such as email address and profile details.',
      'Task content you create, including titles, notes, labels, and due dates.',
      'Device and app data such as device type, OS version, and app usage diagnostics.',
    ],
  },
  {
    title: 'How We Use Information',
    body: [
      'Provide and maintain the app features you use.',
      'Sync your tasks across devices and enable sign-in.',
      'Improve reliability, performance, and user experience.',
      'Communicate important updates or security notices.',
    ],
  },
  {
    title: 'Storage and Security',
    body: [
      'We store your information securely and use reasonable safeguards to protect it.',
      'No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    title: 'Sharing',
    body: [
      'We do not sell your personal information.',
      'We may share data with service providers who help operate the app, under confidentiality obligations.',
      'We may disclose information if required by law or to protect our rights and users.',
    ],
  },
  {
    title: 'Your Choices',
    body: [
      'You can update or delete tasks directly in the app.',
      'You can request account deletion and associated data removal.',
    ],
  },
  {
    title: 'Children’s Privacy',
    body: ['The app is not intended for children under 13 and we do not knowingly collect their data.'],
  },
  {
    title: 'Changes to This Policy',
    body: [
      'We may update this policy from time to time.',
      'We will post the updated date at the top of this page.',
    ],
  },
  {
    title: 'Contact',
    body: ['If you have questions about this policy, contact us at support@example.com.'],
  },
];

export default function PrivacyPolicy() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 40,
      }}>
      <View className="px-6">
        <Text className="text-foreground text-2xl font-semibold">Privacy Policy</Text>
        <Text className="text-muted-foreground mt-2 text-sm">Last updated: {lastUpdated}</Text>

        <View className="mt-6 gap-6">
          {sections.map((section) => (
            <View key={section.title} className="gap-2">
              <Text className="text-foreground text-base font-semibold">{section.title}</Text>
              {section.body.map((paragraph) => (
                <Text key={paragraph} className="text-muted-foreground text-sm leading-6">
                  {paragraph}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}