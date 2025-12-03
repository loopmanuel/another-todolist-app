import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { Keyboard, Pressable, TextInput, View } from 'react-native';
import { Button, useThemeColor } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';

import { Text } from '@/components/ui/text';
import type { Tables } from '@/supabase/database.types';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const LABEL_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#0ea5e9', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
];

export type EditLabelSheetRef = {
  present: (label: Tables<'labels'>) => void;
  dismiss: () => void;
};

type EditLabelSheetProps = {
  onSave: (labelId: string, name: string, color: string) => Promise<void>;
  onDelete: (labelId: string, labelName: string) => void;
};

export const EditLabelSheet = forwardRef<EditLabelSheetRef, EditLabelSheetProps>(
  ({ onSave, onDelete }, ref) => {
    const backgroundColor = useThemeColor('background');
    const borderColor = useThemeColor('border');

    const [label, setLabel] = useState<Tables<'labels'> | null>(null);
    const [editedName, setEditedName] = useState('');
    const [editedColor, setEditedColor] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const snapPoints = useMemo(() => ['80%'], []);

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        setIsOpen(false);
        Keyboard.dismiss();
      }
    }, []);

    const renderBackdrop = useCallback(
      (props: BottomSheetDefaultBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
      ),
      []
    );

    useImperativeHandle(ref, () => ({
      present: (labelToEdit: Tables<'labels'>) => {
        setLabel(labelToEdit);
        setEditedName(labelToEdit.name);
        setEditedColor(labelToEdit.color || LABEL_COLORS[0]);
        setIsOpen(true);
      },
      dismiss: () => {
        setIsOpen(false);
      },
    }));

    const handleSave = async () => {
      if (!label || !editedName.trim()) return;

      setIsSaving(true);
      try {
        await onSave(label.id, editedName, editedColor);
        Keyboard.dismiss();
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to save label:', error);
      } finally {
        setIsSaving(false);
      }
    };

    const handleDelete = () => {
      if (!label) return;
      onDelete(label.id, label.name);
      setIsOpen(false);
    };

    if (!isOpen) {
      return null;
    }

    return (
      <BottomSheet
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor }}
        handleIndicatorStyle={{ backgroundColor: borderColor }}>
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 24 }}>
          <KeyboardAvoidingView className={'flex-1'}>
            <View className="mb-6">
              <Text className="text-foreground text-center text-lg font-semibold">Edit Label</Text>
            </View>

            {/* Label Name Input */}
            <View className="mb-4">
              <Text className="text-muted-foreground mb-2 text-sm font-medium">Label Name</Text>
              <TextInput
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter label name"
                placeholderTextColor="#9ca3af"
                className="border-border text-foreground rounded-lg border px-4 py-3"
                autoFocus
              />
            </View>

            {/* Color Picker */}
            <View className="mb-6">
              <Text className="text-muted-foreground mb-3 text-sm font-medium">Color</Text>
              <View className="flex-row flex-wrap gap-2">
                {LABEL_COLORS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setEditedColor(color)}
                    className="size-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: color }}>
                    {editedColor === color && <Ionicons name="checkmark" size={20} color="white" />}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Preview */}
            <View className="border-border bg-surface mb-6 flex-row items-center gap-3 rounded-xl border px-4 py-3">
              <Ionicons name="pricetag" size={20} color={editedColor} />
              <Text className="text-foreground flex-1 text-base">{editedName || 'Label name'}</Text>
            </View>

            {/* Action Buttons */}
            <View className="gap-3">
              <View className="flex-row gap-3">
                <Button
                  className="flex-1"
                  variant="secondary"
                  onPress={() => setIsOpen(false)}
                  isDisabled={isSaving}>
                  <Button.Label>Cancel</Button.Label>
                </Button>
                <Button
                  className="flex-1"
                  onPress={handleSave}
                  isDisabled={!editedName.trim() || isSaving}>
                  <Button.Label>Save</Button.Label>
                </Button>
              </View>
              <Button variant="destructive-soft" onPress={handleDelete} isDisabled={isSaving}>
                <Ionicons name="trash-outline" size={18} />
                <Button.Label>Delete Label</Button.Label>
              </Button>
            </View>
          </KeyboardAvoidingView>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

EditLabelSheet.displayName = 'EditLabelSheet';
