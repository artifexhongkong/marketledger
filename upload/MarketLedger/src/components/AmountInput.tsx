import React from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { CURRENCIES } from '../constants';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants/colors';

interface AmountInputProps extends Omit<TextInputProps, 'value'> {
  /** 顯示金額（格式化後） */
  displayValue?: string;
  /** 當金額改變時的回調 */
  onAmountChange?: (amount: string) => void;
}

/** 帶幣別前綴的金額輸入框 */
export function AmountInput({
  displayValue,
  onAmountChange,
  style,
  ...rest
}: AmountInputProps) {
  const currency = useSettingsStore((s: { currency: string }) => s.currency);
  const symbol = CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol ?? '';

  return (
    <View style={styles.container}>
      <Text style={styles.symbol}>{symbol}</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor={COLORS.textTertiary}
        keyboardType="decimal-pad"
        value={displayValue}
        onChangeText={onAmountChange}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  symbol: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.xxl,
    color: COLORS.text,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
