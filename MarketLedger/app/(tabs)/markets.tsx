import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMarketStore } from '../../src/stores/marketStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { MarketCard } from '../../src/components/MarketCard';
import { MarketData } from '../../src/constants';
import { formatCurrency } from '../../src/utils/formatCurrency';
import { calculateMarketSummary } from '../../src/utils/calculateProfit';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/colors';

/** 市集頁面 — 全球市集列表 + 設定當前市集 */
export default function MarketsPage() {
  const markets = useMarketStore((s) => s.markets);
  const currentMarketId = useMarketStore((s) => s.currentMarketId);
  const setCurrentMarket = useMarketStore((s) => s.setCurrentMarket);
  const transactions = useTransactionStore((s) => s.transactions);
  const currency = useSettingsStore((s) => s.currency);

  const [filterCity, setFilterCity] = React.useState<string>('all');
  const [filterType, setFilterType] = React.useState<string>('all');

  // 過濾
  const filtered = markets.filter((m) => {
    if (filterCity !== 'all' && m.city !== filterCity) return false;
    if (filterType !== 'all' && m.type !== filterType) return false;
    return true;
  });

  const handleSelectMarket = (market: MarketData) => {
    if (currentMarketId === market.id) {
      Alert.alert(
        '取消市集',
        `目前選中：${market.name}\n要取消選擇嗎？`,
        [
          { text: '取消', style: 'cancel' },
          { text: '取消選擇', onPress: () => setCurrentMarket(null) },
        ]
      );
    } else {
      setCurrentMarket(market.id);
      Alert.alert('✓ 已切換市集', `目前市集：${market.name}\n之後記帳會自動帶入此市集`);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* 標題 */}
        <Text style={styles.pageTitle}>🌏 全球市集</Text>
        <Text style={styles.pageSubtitle}>
          點擊市集設為「當前市集」，記帳時會自動帶入
        </Text>

        {/* 當前市集 */}
        {currentMarketId && (
          <View style={styles.currentBox}>
            <Text style={styles.currentLabel}>📍 當前市集</Text>
            <Text style={styles.currentName}>
              {markets.find((m) => m.id === currentMarketId)?.name ?? ''}
            </Text>
          </View>
        )}

        {/* 城市篩選 */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>城市：</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: '全部' },
              { key: 'HK', label: '香港' },
              { key: 'TW', label: '台灣' },
              { key: 'TH', label: '泰國' },
              { key: 'MY', label: '馬來西亞' },
              { key: 'SG', label: '新加坡' },
            ].map((c) => (
              <TouchableOpacity
                key={c.key}
                style={[styles.filterChip, filterCity === c.key && styles.filterChipActive]}
                onPress={() => setFilterCity(c.key)}
              >
                <Text style={[styles.filterChipText, filterCity === c.key && { color: '#FFF' }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 類型篩選 */}
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>類型：</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: '全部' },
              { key: 'night', label: '夜市' },
              { key: 'weekend', label: '週末' },
              { key: 'pop-up', label: '快閃' },
              { key: 'festival', label: '節慶' },
            ].map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.filterChip, filterType === t.key && styles.filterChipActive]}
                onPress={() => setFilterType(t.key)}
              >
                <Text style={[styles.filterChipText, filterType === t.key && { color: '#FFF' }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 市集列表 */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyText}>沒有符合條件的市集</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filtered.map((market) => {
              const summary = calculateMarketSummary(transactions, market.id);
              const isCurrent = currentMarketId === market.id;
              return (
                <View key={market.id} style={styles.marketWrap}>
                  <MarketCard
                    market={market}
                    onPress={() => handleSelectMarket(market)}
                  />
                  {/* 營業額小卡 */}
                  {summary.transactionCount > 0 && (
                    <View style={styles.marketStats}>
                      <Text style={styles.marketStatsLabel}>
                        已記錄 {summary.transactionCount} 筆 · 營業額：
                      </Text>
                      <Text style={[styles.marketStatsValue, { color: summary.profit >= 0 ? COLORS.income : COLORS.expense }]}>
                        {formatCurrency(summary.profit, currency)}
                      </Text>
                    </View>
                  )}
                  {/* 選中標記 */}
                  {isCurrent && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓ 目前選中</Text>
                    </View>
                  )}
                </View>
              );
            })}
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
  pageTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  pageSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  currentBox: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: 4,
  },
  currentLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  currentName: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  filterLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.xs,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  list: {
    gap: SPACING.md,
  },
  marketWrap: {
    position: 'relative',
    gap: SPACING.xs,
  },
  marketStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  marketStatsLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  marketStatsValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  selectedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  selectedBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: '#FFF',
    fontWeight: FONT_WEIGHT.bold,
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
