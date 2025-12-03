import type { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export type SettingsRoute = {
  id: string;
  title: string;
  description?: string;
  icon: IconName;
  iconColor?: string;
  route?: Href;
  onPress?: () => void;
  disabled?: boolean;
};

export type SettingsSection = {
  id: string;
  title?: string;
  routes: SettingsRoute[];
};

/**
 * Type-safe settings navigation configuration
 * Edit this object to add, remove, or modify settings routes
 */
export const settingsNavigation: SettingsSection[] = [
  {
    id: 'app-settings',
    title: 'App Settings',
    routes: [
      {
        id: 'appearance',
        title: 'Appearance',
        description: 'Theme, colors, and display',
        icon: 'color-palette-outline',
        iconColor: '#3b82f6', // blue
        route: '/settings/appearance',
      },
      {
        id: 'notifications',
        title: 'Notifications',
        description: 'Manage alerts and reminders',
        icon: 'notifications-outline',
        iconColor: '#8b5cf6', // violet
        route: '/settings/notifications',
      },
      {
        id: 'labels',
        title: 'Labels',
        description: 'Manage your task labels',
        icon: 'pricetag-outline',
        iconColor: '#a855f7', // purple
        route: '/settings/labels',
      },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    routes: [
      {
        id: 'help-feedback',
        title: 'Help & Feedback',
        description: 'Get help or send us feedback',
        icon: 'help-circle-outline',
        iconColor: '#10b981', // emerald
        route: '/settings/help',
      },
      {
        id: 'follow-us',
        title: 'Follow Us',
        description: 'Stay updated on social media',
        icon: 'share-social-outline',
        iconColor: '#06b6d4', // cyan
        route: '/settings/social',
      },
    ],
  },
  {
    id: 'about',
    title: 'About',
    routes: [
      {
        id: 'privacy',
        title: 'Privacy Policy',
        icon: 'shield-checkmark-outline',
        iconColor: '#22c55e', // green
        route: '/settings/privacy',
      },
      {
        id: 'terms',
        title: 'Terms of Service',
        icon: 'document-text-outline',
        iconColor: '#f59e0b', // amber
        route: '/settings/terms',
      },
      {
        id: 'version',
        title: 'App Version',
        description: '1.0.0',
        icon: 'information-circle-outline',
        iconColor: '#6366f1', // indigo
        disabled: true,
      },
    ],
  },
];
