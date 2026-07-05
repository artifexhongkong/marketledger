import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MarketData } from '../constants';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../constants/colors';

interface MarketCardProps {
  market: MarketData;
  onPress?: () => void;
}

const CITY_LABELS: Record<string, string> = {
  HK: '香港',
  TW: '台灣',
  TH: '泰國',
  MY: '馬來西亞',
  SG: '新加坡',
};

/** 市集資訊卡片 */
export function MarketCard({ market, onPress }: MarketCardProps) {
  const typeLabels: Record<string, string> = {
    night: '夜市',
    weekend: '週末市集',
    'pop-up': '快閃',
    festival: '節慶市集',
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* 頂部：城市標籤 + 類型 */}
      <View style={styles.header}>
        <View style={[styles.badge, styles.cityBadge]}>
          <Text style={styles.badgeText}>{CITY_LABELS[market.city] ?? market.city}</Text>
        </View>
        <View style={[styles.badge, styles.typeBadge]}>
          <Text style={styles.badgeText}>{typeLabels[market.type]}</Text>
        </View>
      </View>

      {/* 標題 */}
      <Text style={styles.title} numberOfLines={1}>
        {market.name}
      </Text>
      <Text style={styles.titleEn} numberOfLines={1}>
        {market.nameEn}
      </Text>

      {/* 位置 */}
      <Text style={styles.location} numberOfLines={1}>
        📍 {market.location}
      </Text>

      {/* 時間 */}
      <Text style={styles.schedule}>🕐 {market.schedule}</Text>

      {/* 底部：攤位數 + 費用 */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>攤位</Text>
          <Text style={styles.footerValue}>{market.boothCount.toLocaleString()} 個</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerItem}>
          <Text style={styles.footerLabel}>費用</Text>
          <Text style={styles.footerValue}>{market.feeRange}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  cityBadge: {
    backgroundColor: COLORS.primary + '20',
  },
  typeBadge: {
    backgroundColor: COLORS.success + '20',
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.semibold,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  titleEn: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  location: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  schedule: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  footerItem: {
    flex: 1,
  },
  footerLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  footerValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  footerDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.divider,
  },
});
