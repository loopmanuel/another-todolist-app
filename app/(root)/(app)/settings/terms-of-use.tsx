import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';

const lastUpdated = 'January 28, 2026';

const sections = [
  {
    title: 'Acceptance of Terms',
    body: [
      'By accessing or using the app, you agree to these Terms of Use.',
      'If you do not agree, do not use the app.',
    ],
  },
  {
    title: 'Account and Eligibility',
    body: [
      'You are responsible for maintaining the confidentiality of your account.',
      'You must provide accurate information and keep it up to date.',
    ],
  },
  {
    title: 'Using the App',
    body: [
      'Do not misuse the app or attempt to interfere with its normal operation.',
      'You may not copy, modify, or distribute the app except as permitted by law.',
    ],
  },
  {
    title: 'Your Content',
    body: [
      'You retain ownership of the tasks and content you create.',
      'You grant us permission to process your content to operate and improve the app.',
    ],
  },
  {
    title: 'Third-Party Services',
    body: [
      'The app may link to or integrate with third-party services.',
      'We are not responsible for the content or policies of those services.',
    ],
  },
  {
    title: 'Availability and Changes',
    body: [
      'We may modify, suspend, or discontinue any part of the app at any time.',
      'We may update these terms and will post the revised date here.',
    ],
  },
  {
    title: 'Disclaimer',
    body: [
      'The app is provided on an “as is” and “as available” basis without warranties of any kind.',
    ],
  },
  {
    title: 'Limitation of Liability',
    body: [
      'To the maximum extent permitted by law, we are not liable for indirect or incidental damages.',
    ],
  },
  {
    title: 'Termination',
    body: [
      'We may suspend or terminate your access if you violate these terms.',
      'You may stop using the app at any time.',
    ],
  },
  {
    title: 'Contact',
    body: ['Questions about these terms can be sent to support@example.com.'],
  },
];

export default function TermsOfUse() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 40,
      }}>
      <View className="px-6">
        <Text className="text-foreground text-2xl font-semibold">Terms of Use</Text>
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