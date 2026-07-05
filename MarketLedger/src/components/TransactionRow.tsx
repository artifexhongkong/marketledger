import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Transaction } from '../types';
import { formatDateTime } from '../utils/formatDate';
import { CATEGORIES, PAYMENT_METHODS } from '../constants';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/colors';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
}

/** 交易明細行 */
export function TransactionRow({ transaction, onEdit }: TransactionRowProps) {
  const category = CATEGORIES.find((c) => c.id === transaction.category);
  const isIncome = transaction.type === 'income';
  const paymentLabel = transaction.paymentMethod
    ? PAYMENT_METHODS[transaction.paymentMethod]?.label
    : null;

  const handleLongPress = () => {
    const options: string[] = ['刪除', '取消'];
    if (onEdit) options.unshift('編輯');

    Alert.alert(
      '交易操作',
      `${category?.label ?? '交易'} · ${formatDateTime(transaction.createdAt)}`,
      options.map((opt) => ({
        text: opt,
        style: opt === '刪除' ? 'destructive' : 'cancel',
        onPress: () => {
          if (opt === '刪除') {
            Alert.alert('確認刪除', '確定要刪除這筆交易嗎？', [
              { text: '取消', style: 'cancel' },
              {
                text: '刪除',
                style: 'destructive',
                onPress: () => {
                  // 透過 store 刪除 — 在父層處理
                  const { useTransactionStore } = require('../stores/transactionStore');
                  useTransactionStore.getState().deleteTransaction(transaction.id);
                },
              },
            ]);
          } else if (opt === '編輯' && onEdit) {
            onEdit(transaction);
          }
        },
      }))
    );
  };

  return (
    <TouchableOpacity
      style={styles.row}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      delayLongPress={400}
    >
      {/* 左側：分類 icon + 資訊 */}
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: (category?.color ?? COLORS.textTertiary) + '20' }]}>
          <Text style={styles.iconText}>{category?.icon ?? '📝'}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.categoryName}>{category?.label ?? transaction.category}</Text>
            {paymentLabel && <Text style={styles.paymentTag}>{paymentLabel}</Text>}
          </View>
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
    </TouchableOpacity>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  categoryName: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  paymentTag: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
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
