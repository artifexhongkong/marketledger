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

/** 首頁儀表板 — 今日摘要 + 最近交易 */
export default function HomePage() {
  const currency = useSettingsStore((s) => s.currency);
  const transactions = useTransactionStore((s) => s.transactions);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const demoSeeded = useSettingsStore((s) => s.demoSeeded);
  const setDemoSeeded = useSettingsStore((s) => s.setDemoSeeded);
  const currentMarketId = useMarketStore((s) => s.currentMarketId);
  const markets = useMarketStore((s) => s.markets);

  const summary = calculateDailySummary(transactions, currency);

  // 示範資料：僅在「未曾植入」時加入一次
  React.useEffect(() => {
    if (!demoSeeded && transactions.length === 0) {
      // 今日範例：銷售收入
      addTransaction({ type: 'income', amount: 2500, currency, category: 'sales', paymentMethod: 'cash', note: '賣手作餅乾', marketId: 'pmq' });
      addTransaction({ type: 'income', amount: 1800, currency, category: 'sales', paymentMethod: 'payme', note: '賣手工飾品', marketId: 'pmq' });
      // 今日範例：支出
      addTransaction({ type: 'expense', amount: 800, currency, category: 'ingredients', paymentMethod: 'cash', note: '進貨麵粉、奶油', marketId: 'pmq' });
      addTransaction({ type: 'expense', amount: 350, currency, category: 'packaging', paymentMethod: 'fps', note: '包裝盒', marketId: 'pmq' });
      addTransaction({ type: 'expense', amount: 200, currency, category: 'rent', paymentMethod: 'cash', note: 'PMQ 攤位費', marketId: 'pmq' });
      // 標記為已植入，避免重複
      setDemoSeeded(true);
    }
  }, [demoSeeded, transactions.length]);

  // 最近 10 筆（今日）
  const recent = summary.todayTransactions
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  const currentMarket = markets.find((m) => m.id === currentMarketId);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* 日期 + 當前市集 */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </Text>
          {currentMarket && (
            <View style={styles.marketBadge}>
              <Text style={styles.marketBadgeText}>📍 {currentMarket.name}</Text>
            </View>
          )}
        </View>

        {/* 今日摘要卡片 */}
        <SummaryCard
          income={summary.income}
          expense={summary.expense}
          profit={summary.profit}
          currency={currency}
        />

        {/* 分類明細 */}
        {Object.keys(summary.byCategory).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>分類明細</Text>
            <View style={styles.categoryList}>
              {Object.entries(summary.byCategory).map(([catId, amount]) => {
                const cat = CATEGORIES.find((c) => c.id === catId);
                return (
                  <View key={catId} style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <Text style={styles.categoryEmoji}>{cat?.icon ?? '📝'}</Text>
                      <Text style={styles.categoryLabel}>{cat?.label ?? catId}</Text>
                    </View>
                    <Text style={[styles.categoryAmount, { color: cat?.type === 'income' ? COLORS.income : COLORS.expense }]}>
                      {cat?.type === 'income' ? '+' : '-'}{formatCurrency(amount, currency)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* 最近交易 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今日交易</Text>
            <Text style={styles.countText}>{summary.transactionCount} 筆</Text>
          </View>
          {recent.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyText}>今日還沒有交易記錄</Text>
              <Text style={styles.emptySubtext}>前往「記帳」頁面開始記錄吧！</Text>
            </View>
          ) : (
            recent.map((t) => <TransactionRow key={t.id} transaction={t} />)
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
  dateHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  marketBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
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
  categoryList: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  categoryAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
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
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
});
