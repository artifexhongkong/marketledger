import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { SummaryCard } from '../../src/components/SummaryCard';
import { TransactionRow } from '../../src/components/TransactionRow';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { calculateDailySummary } from '../../src/utils/calculateProfit';
import { CATEGORIES } from '../../src/constants';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/colors';

/** 日報頁面 — 詳細收支明細與分類統計 */
export default function DailyPage() {
  const currency = useSettingsStore((s) => s.currency);
  const transactions = useTransactionStore((s) => s.transactions);
  const summary = calculateDailySummary(transactions, currency);

  // 按分類分組
  const groupedByCategory: Record<string, typeof transactions> = {};
  transactions
    .sort((a, b) => b.createdAt - a.createdAt)
    .forEach((t) => {
      if (!groupedByCategory[t.category]) {
        groupedByCategory[t.category] = [];
      }
      groupedByCategory[t.category].push(t);
    });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 今日摘要 */}
      <SummaryCard
        income={summary.income}
        expense={summary.expense}
        profit={summary.profit}
        currency={currency}
      />

      {/* 分類統計 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>分類統計</Text>
        {CATEGORIES.map((cat) => {
          const items = groupedByCategory[cat.id] || [];
          const total = items.reduce((sum, t) => sum + t.amount, 0);
          if (total === 0) return null;
          return (
            <View key={cat.id} style={styles.statRow}>
              <View style={styles.statLeft}>
                <Text style={styles.statEmoji}>{cat.icon}</Text>
                <Text style={styles.statLabel}>{cat.label}</Text>
              </View>
              <View style={styles.statRight}>
                <Text style={[styles.statAmount, { color: cat.type === 'income' ? COLORS.income : COLORS.expense }]}>
                  {formatCurrency(total, currency as any)}
                </Text>
                <Text style={styles.statCount}>{items.length} 筆</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* 支付方式統計 */}
      {Object.keys(summary.byPaymentMethod).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>支付方式</Text>
          {Object.entries(summary.byPaymentMethod).map(([method, amount]) => {
            const labels: Record<string, string> = {
              cash: '💵 現金',
              payme: '💳 PayMe',
              fps: '⚡ FPS',
              alipayhk: '🅰️ AlipayHK',
              wechat_pay: '💬 WeChat Pay',
            };
            return (
              <View key={method} style={styles.statRow}>
                <Text style={styles.statLabel}>{labels[method] ?? method}</Text>
                <Text style={styles.statAmount}>{formatCurrency(amount, currency as any)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* 全部交易明細 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>交易明細</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyText}>尚無交易記錄</Text>
          </View>
        ) : (
          [...transactions]
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((t) => <TransactionRow key={t.id} transaction={t} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statEmoji: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  statRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  statAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  statCount: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
});
