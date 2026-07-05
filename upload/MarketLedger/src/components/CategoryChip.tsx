import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Category } from '../constants';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE } from '../constants/colors';

interface CategoryChipProps {
  category: Category;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

/** 可點擊的分類標籤 */
export function CategoryChip({
  category,
  selected,
  onPress,
  style,
}: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && { backgroundColor: category.color, borderColor: category.color },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, selected && { opacity: 0.9 }]}>
        {category.icon}
      </Text>
      <Text
        style={[
          styles.label,
          selected && { color: COLORS.textInverse },
        ]}
      >
        {category.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
});
