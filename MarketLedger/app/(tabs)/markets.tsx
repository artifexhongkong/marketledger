import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/colors';

/** 市集頁面 — 功能開發中（與市集主辦方洽談中） */
export default function MarketsPage() {
  const [showPreview, setShowPreview] = React.useState(false);

  const futureFeatures = [
    { icon: '🗺️', text: '全球市集行事曆與報名' },
    { icon: '📊', text: '各市集營業額情報' },
    { icon: '🤝', text: '線上攤位申請' },
    { icon: '💡', text: '市集比較與建議' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* 標題 */}
        <View style={styles.header}>
          <Text style={styles.title}>🌏 全球市集</Text>
          <Text style={styles.subtitle}>探索世界各地的市集機會</Text>
        </View>

        {/* Coming soon 主卡片 */}
        <View style={styles.comingSoonCard}>
          {/* 裝飾光點效果用簡單的背景色模擬 */}
          <View style={styles.comingSoonIcon}>
            <Text style={styles.comingSoonIconEmoji}>🤝</Text>
          </View>
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonBadgeText}>✨ 功能開發中</Text>
          </View>
          <Text style={styles.comingSoonTitle}>
            全球市集功能{'\n'}正在與各國市集主辦方洽談
          </Text>
          <Text style={styles.comingSoonDesc}>
            我們正積極與香港 PMQ、JFFLUX、台灣簡單生活節、泰國 Chatuchak、馬來西亞 Pasar Malam 等市集主辦方接洽合作。完成後將提供：
          </Text>

          {/* 未來功能清單 */}
          <View style={styles.featureList}>
            {futureFeatures.map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>{f.icon}</Text>
                </View>
                <Text style={styles.featureText}>{f.text}</Text>
                <Text style={styles.featureLock}>🔒</Text>
              </View>
            ))}
          </View>

          {/* 預計上線 */}
          <View style={styles.timeline}>
            <View>
              <Text style={styles.timelineLabel}>預計上線</Text>
              <Text style={styles.timelineValue}>V3 版本 · 2026 Q4</Text>
            </View>
            <TouchableOpacity onPress={() => setShowPreview(!showPreview)}>
              <Text style={styles.timelineLink}>
                {showPreview ? '收起預覽' : '查看設計草圖 →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Beta 等候名單 */}
        <View style={styles.betaCard}>
          <View style={styles.betaIcon}>
            <Text style={styles.betaIconText}>💡</Text>
          </View>
          <View style={styles.betaContent}>
            <Text style={styles.betaTitle}>想搶先體驗？</Text>
            <Text style={styles.betaDesc}>
              我們正在徵求 50 位種子用戶參與 Beta 測試，並優先獲得市集情報。如果你是市集主辦方或常態攤商，也歡迎與我們接洽合作。
            </Text>
            <View style={styles.betaActions}>
              <TouchableOpacity style={styles.betaBtnPrimary}>
                <Text style={styles.betaBtnPrimaryText}>加入 Beta 等候名單</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.betaBtnSecondary}>
                <Text style={styles.betaBtnSecondaryText}>了解合作方案</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, gap: SPACING.lg },
  header: { gap: SPACING.xs },
  title: { fontSize: FONT_SIZE.xxxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  subtitle: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
  // Coming soon
  comingSoonCard: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
    gap: SPACING.md,
  },
  comingSoonIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  comingSoonIconEmoji: { fontSize: 22 },
  comingSoonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent + '25',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  comingSoonBadgeText: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.accent },
  comingSoonTitle: {
    fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text, lineHeight: 26,
  },
  comingSoonDesc: {
    fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, lineHeight: 18,
  },
  featureList: { gap: SPACING.sm, marginTop: SPACING.xs },
  featureItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.card + 'CC',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
  featureIcon: {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: COLORS.muted,
    alignItems: 'center', justifyContent: 'center',
  },
  featureIconText: { fontSize: 14 },
  featureText: { flex: 1, fontSize: FONT_SIZE.xs, color: COLORS.text },
  featureLock: { fontSize: 12, color: COLORS.textTertiary },
  timeline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  timelineLabel: { fontSize: 10, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  timelineValue: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  timelineLink: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.primary },
  // Beta card
  betaCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  betaIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  betaIconText: { fontSize: 16 },
  betaContent: { flex: 1, gap: SPACING.xs },
  betaTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  betaDesc: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, lineHeight: 18 },
  betaActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  betaBtnPrimary: {
    flex: 1, backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm, alignItems: 'center',
  },
  betaBtnPrimaryText: { color: '#FFFFFF', fontSize: FONT_SIZE.xs, fontWeight: '600' },
  betaBtnSecondary: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm, alignItems: 'center',
  },
  betaBtnSecondaryText: { color: COLORS.primary, fontSize: FONT_SIZE.xs, fontWeight: '600' },
});
