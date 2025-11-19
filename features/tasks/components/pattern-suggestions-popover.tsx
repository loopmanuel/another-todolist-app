import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Pressable } from 'react-native';
import { Popover, Button, type PopoverTriggerRef } from 'heroui-native';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import type { ParsedPatterns } from '../parsing/types';

interface PatternSuggestionsPopoverProps {
  patterns: ParsedPatterns;
  onApplyDate: (date: string, patternText: string, normalizedText: string) => void;
  onApplyLabel: (labelId: string | undefined, labelName: string, patternText: string) => void;
  onApplyPriority: (priority: number, patternText: string) => void;
  onDismiss: () => void;
}

export interface PatternSuggestionsPopoverRef {
  open: () => void;
  close: () => void;
}

export const PatternSuggestionsPopover = forwardRef<
  PatternSuggestionsPopoverRef,
  PatternSuggestionsPopoverProps
>(({ patterns, onApplyDate, onApplyLabel, onApplyPriority, onDismiss }, ref) => {
  const popoverRef = useRef<PopoverTriggerRef>(null);

  useImperativeHandle(ref, () => ({
    open: () => popoverRef.current?.open(),
    close: () => popoverRef.current?.close(),
  }));

  if (!patterns.hasPatterns) {
    return null;
  }

  return (
    <Popover>
      <Popover.Trigger ref={popoverRef} asChild>
        <View style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }} />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Overlay className="bg-black/15" />
        <Popover.Content className={'px-2 py-2'}>
          <Popover.Close onPress={onDismiss} />

          <View className="gap-3">
            <View className="gap-2">
              {/* Date suggestions */}
              {patterns.dates.map((date, index) => (
                <Pressable
                  key={`date-${index}`}
                  className="flex-row items-center justify-between rounded-lg bg-blue-50 p-1"
                  style={{ minWidth: 150 }}
                  onPress={() => {
                    onApplyDate(date.suggestedDate, date.text, date.normalizedText);
                  }}>
                  <View className="flex-1 shrink-0 flex-row items-center gap-2">
                    <View className="size-8 items-center justify-center rounded-full bg-blue-100">
                      <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
                    </View>
                    <View className="flex-1 shrink-0 ">
                      <Text className="text-foreground whitespace-nowrap text-base font-medium">
                        {date.displayText}
                      </Text>
                      {/*<Text className="text-muted-foreground text-xs">Detected: "{date.text}"</Text>*/}
                    </View>
                  </View>
                </Pressable>
              ))}

              {/* Label suggestions */}
              {patterns.labels.map((label, index) => (
                <Pressable
                  key={`label-${index}`}
                  className="flex-row items-center justify-between rounded-lg bg-purple-50 p-1"
                  onPress={() => {
                    onApplyLabel(label.labelId, label.labelName, label.text);
                  }}>
                  <View className="flex-1 shrink-0 flex-row items-center gap-2">
                    <View className="size-8 items-center justify-center rounded-full bg-purple-100">
                      <Ionicons name="pricetag-outline" size={16} color="#a855f7" />
                    </View>
                    <View className="flex-1 shrink-0">
                      <Text className="text-foreground whitespace-nowrap text-base font-medium">
                        {label.labelName}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}

              {/* Priority suggestions */}
              {patterns.priorities.map((priority, index) => (
                <Pressable
                  key={`priority-${index}`}
                  className="flex-row items-center justify-between rounded-lg bg-orange-50 p-1"
                  onPress={() => {
                    onApplyPriority(priority.priority, priority.text);
                  }}>
                  <View className="flex-1 shrink-0 flex-row items-center gap-2">
                    <View className="size-8 items-center justify-center rounded-full bg-orange-100">
                      <Ionicons
                        name={priority.priority === 3 ? 'warning' : 'flag-outline'}
                        size={16}
                        color="#f97316"
                      />
                    </View>
                    <View className="flex-1 shrink-0">
                      <Text className="text-foreground whitespace-nowrap text-base font-medium">
                        {priority.displayText}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </Popover.Content>
      </Popover.Portal>
    </Popover>
  );
});
