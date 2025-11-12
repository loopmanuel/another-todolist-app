import { memo, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tinycolor from 'tinycolor2';

import { Text } from '@/components/ui/text';
import type { Tables } from '@/supabase/database.types';

type ListTileProps = {
  list: Tables<'projects'>;
  onPress?: (list: Tables<'projects'>) => void;
  uncompletedCount?: number;
};

function ListTileComponent({ list, onPress, uncompletedCount }: ListTileProps) {
  const accentColor = useMemo(() => {
    const fallback = '#e5e7eb';
    if (!list.color) {
      return fallback;
    }
    return list.color.trim().length > 0 ? list.color : fallback;
  }, [list.color]);

  return (
    <Pressable className="mb-4 flex flex-row items-center gap-3" onPress={() => onPress?.(list)}>
      <View
        className="h-11 w-11 items-center justify-center rounded-xl"
        style={{
          backgroundColor: tinycolor(accentColor ?? '#ffffff')
            .setAlpha(0.3)
            .toRgbString(),
        }}>
        {list.icon ? (
          <Text className={'text-xl'}>{list.icon}</Text>
        ) : (
          <Ionicons name="list-outline" size={20} color="#111827" />
        )}
      </View>
      <View className="flex-1">
        <Text className={'text-base font-semibold'} numberOfLines={1}>
          {list.name}
        </Text>
      </View>
      {uncompletedCount !== undefined && uncompletedCount > 0 && (
        <View className={'h-6 w-6 items-center justify-center rounded-md bg-gray-200'}>
          <Text className={'text-muted text-sm font-medium'}>{uncompletedCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

export const ListTile = memo(ListTileComponent);
