import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useMarketStore } from '../../src/stores/marketStore';
import { SummaryCard } from '../../src/components/SummaryCard';
import { TransactionRow } from '../../src/components/TransactionRow';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { calculateDailySummary } from '../../src/utils/calculateProfit';
import { CATEGORIES, PAYMENT_METHODS } from '../../src/constants';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/colors';

/** 日報頁面 — 今日詳細收支明細與分類統計 */
export default function DailyPage() {
  const currency = useSettingsStore((s) => s.currency);
  const transactions = useTransactionStore((s) => s.transactions);
  const markets = useMarketStore((s) => s.markets);
  const summary = calculateDailySummary(transactions, currency);

  // 使用今日交易（而非全部）做明細列表
  const todayTx = summary.todayTransactions.slice().sort((a, b) => b.createdAt - a.createdAt);

  // 按分類分組（今日）
  const groupedByCategory: Record<string, typeof transactions> = {};
  summary.todayTransactions.forEach((t) => {
    if (!groupedByCategory[t.category]) {
      groupedByCategory[t.category] = [];
    }
    groupedByCategory[t.category].push(t);
  });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
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
          <Text style={styles.sectionTitle}>分類統計（今日）</Text>
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
                    {formatCurrency(total, currency)}
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
            <Text style={styles.sectionTitle}>支付方式（今日）</Text>
            {Object.entries(summary.byPaymentMethod).map(([method, amount]) => {
              const label = PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS]?.label ?? method;
              const icon = PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS]?.icon ?? '';
              return (
                <View key={method} style={styles.statRow}>
                  <Text style={styles.statLabel}>{icon} {label}</Text>
                  <Text style={styles.statAmount}>{formatCurrency(amount, currency)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* 市集統計 */}
        {Object.keys(summary.byMarket).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>市集營業額（今日）</Text>
            {Object.entries(summary.byMarket).map(([mid, amount]) => {
              const market = markets.find((m) => m.id === mid);
              return (
                <View key={mid} style={styles.statRow}>
                  <Text style={styles.statLabel}>
                    {market ? `🏪 ${market.name}` : '🌐 未指定'}
                  </Text>
                  <Text style={[styles.statAmount, { color: COLORS.primary }]}>
                    {formatCurrency(amount, currency)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* 今日交易明細 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今日交易明細</Text>
            <Text style={styles.countText}>{todayTx.length} 筆</Text>
          </View>
          {todayTx.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyText}>今日尚無交易記錄</Text>
              <Text style={styles.emptySubtext}>提示：長按交易可刪除</Text>
            </View>
          ) : (
            <View style={styles.txList}>
              {todayTx.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  countText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
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
  txList: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: SPACING.lg,
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
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});
