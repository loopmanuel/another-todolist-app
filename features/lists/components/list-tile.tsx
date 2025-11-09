import { memo, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import type { Tables } from '@/supabase/database.types';

type ListTileProps = {
  list: Tables<'projects'>;
  onPress?: (list: Tables<'projects'>) => void;
};

function ListTileComponent({ list, onPress }: ListTileProps) {
  const accentColor = useMemo(() => {
    const fallback = '#e5e7eb';
    if (!list.color) {
      return fallback;
    }
    return list.color.trim().length > 0 ? list.color : fallback;
  }, [list.color]);

  return (
    <Pressable
      className="mb-4 flex flex-row items-center gap-4 bg-white"
      onPress={() => onPress?.(list)}>
      <View
        className="h-14 w-14 items-center justify-center rounded-lg"
        style={{ backgroundColor: accentColor }}>
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
      <Ionicons name="chevron-forward" size={18} color="#a1a1aa" />
    </Pressable>
  );
}

export const ListTile = memo(ListTileComponent);
