import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/formatCurrency';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/colors';

interface SummaryCardProps {
  income: number;
  expense: number;
  profit: number;
  currency: string;
}

/** 日報摘要卡片（收入 / 支出 / 利潤） */
export function SummaryCard({ income, expense, profit, currency }: SummaryCardProps) {
  return (
    <View style={styles.container}>
      {/* 收入 */}
      <View style={styles.column}>
        <Text style={styles.label}>收入</Text>
        <Text style={[styles.amount, { color: COLORS.income }]}>
          {formatCurrency(income, currency as any)}
        </Text>
      </View>

      {/* 分隔線 */}
      <View style={styles.divider} />

      {/* 支出 */}
      <View style={styles.column}>
        <Text style={styles.label}>支出</Text>
        <Text style={[styles.amount, { color: COLORS.expense }]}>
          {formatCurrency(expense, currency as any)}
        </Text>
      </View>

      {/* 分隔線 */}
      <View style={styles.divider} />

      {/* 利潤 */}
      <View style={styles.column}>
        <Text style={styles.label}>利潤</Text>
        <Text
          style={[
            styles.amount,
            {
              color: profit >= 0 ? COLORS.income : COLORS.expense,
            },
          ]}
        >
          {profit >= 0 ? '+' : ''}
          {formatCurrency(Math.abs(profit), currency as any)}
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
  column: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  amount: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.divider,
  },
});
