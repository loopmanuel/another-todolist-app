import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Card } from 'heroui-native';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import type { ParsedPatterns } from '../parsing/types';

interface PatternSuggestionsCardProps {
  patterns: ParsedPatterns;
  onApplyDate: (date: string, patternText: string, normalizedText: string) => void;
  onApplyLabel: (labelId: string | undefined, labelName: string, patternText: string) => void;
  onApplyPriority: (priority: number, patternText: string) => void;
  onDismiss: () => void;
}

export const PatternSuggestionsCard: React.FC<PatternSuggestionsCardProps> = ({
  patterns,
  onApplyDate,
  onApplyLabel,
  onApplyPriority,
  onDismiss,
}) => {
  if (!patterns.hasPatterns) {
    return null;
  }

  return (
    <Card className="border-border m-4 mb-2 border">
      <Card.Body>
        <View className="gap-3">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold">Suggestions</Text>
            <Pressable onPress={onDismiss} className="p-1">
              <Ionicons name="close-outline" size={20} />
            </Pressable>
          </View>

          {/* Suggestions List */}
          <ScrollView
            horizontal
            keyboardShouldPersistTaps="always"
            showsHorizontalScrollIndicator={false}
            className="gap-2">
            <View className="flex-row gap-2">
              {/* Date suggestions */}
              {patterns.dates.map((date, index) => (
                <Pressable
                  key={`date-${index}`}
                  className="flex-row items-center gap-2 rounded-lg bg-blue-50 px-3 py-2"
                  onPress={() => {
                    onApplyDate(date.suggestedDate, date.text, date.normalizedText);
                  }}>
                  <View className="size-8 items-center justify-center rounded-full bg-blue-100">
                    <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
                  </View>
                  <Text className="text-foreground whitespace-nowrap text-sm font-medium">
                    {date.displayText}
                  </Text>
                </Pressable>
              ))}

              {/* Label suggestions */}
              {patterns.labels.map((label, index) => (
                <Pressable
                  key={`label-${index}`}
                  className="flex-row items-center gap-2 rounded-lg bg-purple-50 px-3 py-2"
                  onPress={() => {
                    onApplyLabel(label.labelId, label.labelName, label.text);
                  }}>
                  <View className="size-8 items-center justify-center rounded-full bg-purple-100">
                    <Ionicons name="pricetag-outline" size={16} color="#a855f7" />
                  </View>
                  <Text className="text-foreground whitespace-nowrap text-sm font-medium">
                    {label.labelName}
                  </Text>
                </Pressable>
              ))}

              {/* Priority suggestions */}
              {patterns.priorities.map((priority, index) => (
                <Pressable
                  key={`priority-${index}`}
                  className="flex-row items-center gap-2 rounded-lg bg-orange-50 px-3 py-2"
                  onPress={() => {
                    onApplyPriority(priority.priority, priority.text);
                  }}>
                  <View className="size-8 items-center justify-center rounded-full bg-orange-100">
                    <Ionicons
                      name={priority.priority === 3 ? 'warning' : 'flag-outline'}
                      size={16}
                      color="#f97316"
                    />
                  </View>
                  <Text className="text-foreground whitespace-nowrap text-sm font-medium">
                    {priority.displayText}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </Card.Body>
    </Card>
  );
};
