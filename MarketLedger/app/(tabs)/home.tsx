import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useMarketStore } from '../../src/stores/marketStore';
import { SummaryCard } from '../../src/components/SummaryCard';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { calculateDailySummary } from '../../src/utils/calculateProfit';
import { CATEGORIES } from '../../src/constants';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/colors';

/** 首頁儀表板 — 今日摘要 + 記錄入口 + 分類明細 */
export default function HomePage() {
  const router = useRouter();
  const currency = useSettingsStore((s) => s.currency);
  const transactions = useTransactionStore((s) => s.transactions);
  const currentMarketId = useMarketStore((s) => s.currentMarketId);
  const markets = useMarketStore((s) => s.markets);

  const summary = calculateDailySummary(transactions, currency);
  const currentMarket = markets.find((m) => m.id === currentMarketId);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* 日期 + 當前市集 */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </Text>
          <Text style={styles.title}>今日營業概況</Text>
          {currentMarket && (
            <View style={styles.marketBadge}>
              <Text style={styles.marketBadgeText}>📍 {currentMarket.name}</Text>
            </View>
          )}
        </View>

        {/* Hero 摘要卡 */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>淨利潤</Text>
          <Text style={styles.heroAmount}>
            {summary.profit >= 0 ? '+' : '−'}
            {formatCurrency(Math.abs(summary.profit), currency)}
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>↑ 收入</Text>
              <Text style={styles.heroStatValue}>{formatCurrency(summary.income, currency)}</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>↓ 支出</Text>
              <Text style={styles.heroStatValue}>{formatCurrency(summary.expense, currency)}</Text>
            </View>
          </View>
        </View>

        {/* 統計小卡 */}
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>交易筆數</Text>
            <Text style={styles.statValue}>{summary.transactionCount}</Text>
            <Text style={styles.statHint}>筆交易</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>平均客單</Text>
            <Text style={styles.statValue}>
              {summary.transactionCount > 0 ? formatCurrency(Math.round(summary.income / summary.transactionCount), currency) : '—'}
            </Text>
            <Text style={styles.statHint}>每筆平均</Text>
          </View>
        </View>

        {/* 今日營業記錄入口卡片 */}
        {summary.transactionCount > 0 && (
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push('/(tabs)/transactions')}
            activeOpacity={0.7}
          >
            <View style={styles.linkIcon}>
              <Ionicons name="list" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.linkContent}>
              <Text style={styles.linkTitle}>今日營業記錄</Text>
              <Text style={styles.linkHint}>{summary.transactionCount} 筆交易 · 點擊查看全部</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
          </TouchableOpacity>
        )}

        {/* 分類明細 */}
        {Object.keys(summary.byCategory).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>分類明細</Text>
            <View style={styles.categoryList}>
              {Object.entries(summary.byCategory).map(([catId, amount]) => {
                const cat = CATEGORIES.find((c) => c.id === catId);
                if (!cat) return null;
                return (
                  <View key={catId} style={styles.categoryRow}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                        <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                      </View>
                      <Text style={styles.categoryLabel}>{cat.label}</Text>
                    </View>
                    <Text style={[styles.categoryAmount, { color: cat.type === 'income' ? COLORS.income : COLORS.expense }]}>
                      {cat.type === 'income' ? '+' : '−'}
                      {formatCurrency(amount, currency)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
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
  },
  marketBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  // Hero 卡
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroLabel: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textInverse,
    marginTop: SPACING.xs,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  heroStatLabel: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  heroStatValue: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textInverse,
    fontWeight: FONT_WEIGHT.semibold,
  },
  heroStatDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // 統計小卡
  statRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginTop: SPACING.xs,
  },
  statHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // 記錄入口卡片
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
  },
  linkHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // 分類明細
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
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
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  categoryAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
