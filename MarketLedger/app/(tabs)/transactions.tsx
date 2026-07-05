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
import { CATEGORIES } from '../../src/constants';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/colors';

/** 記錄頁面 — 今日全部交易 */
export default function TransactionsPage() {
  const currency = useSettingsStore((s) => s.currency);
  const transactions = useTransactionStore((s) => s.transactions);
  const markets = useMarketStore((s) => s.markets);
  const currentMarketId = useMarketStore((s) => s.currentMarketId);
  const summary = calculateDailySummary(transactions, currency);

  const todayTx = summary.todayTransactions.slice().sort((a, b) => b.createdAt - a.createdAt);
  const currentMarket = markets.find((m) => m.id === currentMarketId);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* 標題區 */}
        <View style={styles.header}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </Text>
          <Text style={styles.title}>今日營業記錄</Text>
          {currentMarket && (
            <View style={styles.marketBadge}>
              <Text style={styles.marketBadgeText}>📍 {currentMarket.name}</Text>
            </View>
          )}
        </View>

        {/* Hero 摘要卡 */}
        <SummaryCard
          income={summary.income}
          expense={summary.expense}
          profit={summary.profit}
          currency={currency}
        />

        {/* 全部交易 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>全部交易</Text>
            <Text style={styles.countText}>{todayTx.length} 筆</Text>
          </View>
          {todayTx.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyText}>今日還沒有交易記錄</Text>
              <Text style={styles.emptySubtext}>前往「記帳」頁面開始記錄</Text>
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
  header: {
    gap: SPACING.xs,
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  marketBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.xs,
  },
  marketBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
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
    fontWeight: FONT_WEIGHT.medium,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});
