import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/formatCurrency';
import { CurrencyCode } from '../types';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/colors';

interface SummaryCardProps {
  income: number;
  expense: number;
  profit: number;
  currency: CurrencyCode;
}

/** 日報摘要卡片（收入 / 支出 / 利潤） */
export function SummaryCard({ income, expense, profit, currency }: SummaryCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <Text style={styles.label}>收入</Text>
        <Text style={[styles.amount, { color: COLORS.income }]}>
          {formatCurrency(income, currency)}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.column}>
        <Text style={styles.label}>支出</Text>
        <Text style={[styles.amount, { color: COLORS.expense }]}>
          {formatCurrency(expense, currency)}
        </Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.column}>
        <Text style={styles.label}>利潤</Text>
        <Text style={[styles.amount, { color: profit >= 0 ? COLORS.income : COLORS.expense }]}>
          {profit >= 0 ? '+' : '−'}
          {formatCurrency(Math.abs(profit), currency)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  column: { alignItems: 'center', flex: 1 },
  label: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  amount: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.semibold },
  divider: { width: 1, height: 40, backgroundColor: COLORS.divider },
});
