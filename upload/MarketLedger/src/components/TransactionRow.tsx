import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Transaction } from '../types';
import { formatDateTime } from '../utils/formatCurrency';
import { CATEGORIES } from '../constants';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/colors';

interface TransactionRowProps {
  transaction: Transaction;
}

/** 交易明細行 */
export function TransactionRow({ transaction }: TransactionRowProps) {
  const category = CATEGORIES.find((c) => c.id === transaction.category);
  const isIncome = transaction.type === 'income';

  return (
    <View style={styles.row}>
      {/* 左側：分類 icon + 資訊 */}
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: category?.color ?? COLORS.textTertiary }]}>
          <Text style={styles.iconText}>{category?.icon ?? '📝'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.categoryName}>{category?.label ?? transaction.category}</Text>
          <Text style={styles.time}>{formatDateTime(transaction.createdAt)}</Text>
          {transaction.note ? (
            <Text style={styles.note} numberOfLines={1}>{transaction.note}</Text>
          ) : null}
        </View>
      </View>

      {/* 右側：金額 */}
      <Text
        style={[
          styles.amount,
          { color: isIncome ? COLORS.income : COLORS.expense },
        ]}
      >
        {isIncome ? '+' : '-'}
        {transaction.amount.toLocaleString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  categoryName: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  time: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  note: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  amount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    marginLeft: SPACING.md,
  },
});
