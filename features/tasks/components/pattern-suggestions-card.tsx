import React, { useEffect, useMemo, useCallback } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Card } from 'heroui-native';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { UseFormSetValue } from 'react-hook-form';
import { usePatternSuggestionsStore } from '@/store/pattern-suggestions-store';
import { useTaskFormStore } from '@/store/task-form-store';
import type { ParsedPatterns } from '../parsing/types';

interface PatternSuggestionsCardProps {
  patterns: ParsedPatterns;
  titleInputValue: string;
  setTitleInputValue: (value: string) => void;
  setValue: UseFormSetValue<any>;
  inputRef?: React.RefObject<any>;
}

export const PatternSuggestionsCard: React.FC<PatternSuggestionsCardProps> = ({
  patterns,
  titleInputValue,
  setTitleInputValue,
  setValue,
  inputRef,
}) => {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  // Get stores
  const { dismissedPatterns, dismissPattern, dismissAllCurrentPatterns } =
    usePatternSuggestionsStore();
  const { addLabel, setPriority } = useTaskFormStore();

  // Determine if suggestions should be shown
  const visible = useMemo(() => {
    if (!patterns.hasPatterns || titleInputValue.trim().length === 0) {
      return false;
    }

    // Check if there are any new patterns that haven't been dismissed
    const currentPatternKeys = [
      ...patterns.dates.map((d) => `date:${d.text}`),
      ...patterns.labels.map((l) => `label:${l.text}`),
      ...patterns.priorities.map((p) => `priority:${p.text}`),
    ];

    return currentPatternKeys.some((key) => !dismissedPatterns.has(key));
  }, [patterns, titleInputValue, dismissedPatterns]);

  // Handle applying date pattern
  const handleApplyDate = useCallback(
    (dateString: string, patternText: string, normalizedText: string) => {
      setValue('dueDate', dateString, { shouldDirty: true, shouldValidate: true });

      // Replace the pattern text with normalized text
      const patternIndex = titleInputValue.indexOf(patternText);
      if (patternIndex !== -1) {
        const newTitle =
          titleInputValue.slice(0, patternIndex) +
          normalizedText +
          titleInputValue.slice(patternIndex + patternText.length);

        const cursorPos = patternIndex + normalizedText.length;

        // Update state first
        setTitleInputValue(newTitle);
        setValue('title', newTitle);

        // Focus management for cursor position
        if (inputRef?.current) {
          inputRef.current.blur();
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.setNativeProps({
                    selection: { start: cursorPos, end: cursorPos },
                  });
                }
              }, 10);
            }
          }, 10);
        }
      }

      // Dismiss this pattern
      dismissPattern(`date:${patternText}`);
    },
    [titleInputValue, setValue, setTitleInputValue, inputRef, dismissPattern]
  );

  // Handle applying label pattern
  const handleApplyLabel = useCallback(
    (labelId: string | undefined, labelName: string, patternText: string) => {
      if (labelId) {
        addLabel(labelId);
      } else {
        console.log('Creating new label not yet implemented:', labelName);
      }

      dismissPattern(`label:${patternText}`);
    },
    [addLabel, dismissPattern]
  );

  // Handle applying priority pattern
  const handleApplyPriority = useCallback(
    (priorityLevel: number, patternText: string) => {
      setPriority(priorityLevel);

      // Remove the priority pattern from the title
      const patternIndex = titleInputValue.indexOf(patternText);
      if (patternIndex !== -1) {
        const newTitle =
          titleInputValue.slice(0, patternIndex) +
          titleInputValue.slice(patternIndex + patternText.length);

        // Remove any extra spaces that might be left
        const trimmedTitle = newTitle.replace(/\s+/g, ' ').trim();

        // Update state
        setTitleInputValue(trimmedTitle);
        setValue('title', trimmedTitle);

        // Focus management for cursor position
        if (inputRef?.current) {
          inputRef.current.blur();
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus();
              setTimeout(() => {
                if (inputRef.current) {
                  const cursorPos = patternIndex;
                  inputRef.current.setNativeProps({
                    selection: { start: cursorPos, end: cursorPos },
                  });
                }
              }, 10);
            }
          }, 10);
        }
      }

      dismissPattern(`priority:${patternText}`);
    },
    [setPriority, dismissPattern, titleInputValue, setTitleInputValue, setValue, inputRef]
  );

  // Handle dismissing all suggestions
  const handleDismissAll = useCallback(() => {
    const currentPatternKeys = [
      ...patterns.dates.map((d) => `date:${d.text}`),
      ...patterns.labels.map((l) => `label:${l.text}`),
      ...patterns.priorities.map((p) => `priority:${p.text}`),
    ];

    dismissAllCurrentPatterns(currentPatternKeys);
  }, [patterns, dismissAllCurrentPatterns]);

  // Animation effect
  useEffect(() => {
    if (visible && patterns.hasPatterns) {
      // Slide in from bottom
      translateY.value = withTiming(0, {
        duration: 300,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      // Slide out to bottom
      translateY.value = withTiming(100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, patterns.hasPatterns, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!patterns.hasPatterns) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle}>
      <Card className="border-border m-4 mb-2 border">
        <Card.Body>
          <View className="gap-3">
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <Text className="text-base font-semibold">Suggestions</Text>
              <Pressable onPress={handleDismissAll} className="p-1">
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
                      handleApplyDate(date.suggestedDate, date.text, date.normalizedText);
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
                      handleApplyLabel(label.labelId, label.labelName, label.text);
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
                      handleApplyPriority(priority.priority, priority.text);
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
    </Animated.View>
  );
};
