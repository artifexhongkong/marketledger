import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useMarketStore } from '../../src/stores/marketStore';
import { MarketCard } from '../../src/components/MarketCard';
import { MarketData } from '../../src/constants';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/colors';

/** 市集頁面 — 全球市集列表 */
export default function MarketsPage() {
  const markets = useMarketStore((s) => s.markets);
  const [filterCity, setFilterCity] = React.useState<string>('all');
  const [filterType, setFilterType] = React.useState<string>('all');

  // 過濾
  const filtered = markets.filter((m) => {
    if (filterCity !== 'all' && m.city !== filterCity) return false;
    if (filterType !== 'all' && m.type !== filterType) return false;
    return true;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 標題 */}
      <Text style={styles.pageTitle}>🌏 全球市集</Text>
      <Text style={styles.pageSubtitle}>探索世界各地的市集機會</Text>

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
          {filtered.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </View>
      )}
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
  pageTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  pageSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
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
