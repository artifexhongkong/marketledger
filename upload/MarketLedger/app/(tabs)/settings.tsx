import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { CURRENCIES, DEFAULT_CURRENCY } from '../../src/constants';
import { CurrencyCode, LanguageCode } from '../../src/types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/colors';

/** 設定頁面 — 幣別、語言、匯出 */
export default function SettingsPage() {
  const currency = useSettingsStore((s) => s.currency);
  const language = useSettingsStore((s) => s.language);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const transactions = useTransactionStore((s) => s.transactions);

  const languages: { key: LanguageCode; label: string }[] = [
    { key: 'zh_TW', label: '繁體中文' },
    { key: 'zh_CN', label: '簡體中文' },
    { key: 'en', label: 'English' },
    { key: 'th', label: 'ไทย' },
    { key: 'ms', label: 'Bahasa Melayu' },
  ];

  const handleExport = (format: 'csv' | 'json') => {
    if (transactions.length === 0) {
      Alert.alert('匯出', '目前沒有交易記錄可以匯出');
      return;
    }
    Alert.alert(
      '匯出資料',
      `即將匯出 ${transactions.length} 筆交易為 ${format.toUpperCase()} 格式。（MVP 僅顯示對話框）`,
      [{ text: '確定' }, { text: '取消', style: 'cancel' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* App 資訊 */}
      <View style={styles.appInfo}>
        <Text style={styles.appTitle}>MarketLedger</Text>
        <Text style={styles.appVersion}>v1.0.0 MVP</Text>
        <Text style={styles.appDesc}>全球市集攤販記帳工具</Text>
      </View>

      {/* 幣別設定 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💱 幣別設定</Text>
        <Text style={styles.sectionHint}>目前選擇：{CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol} ({currency})</Text>
        <View style={styles.optionGrid}>
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.optionChip,
                currency === code && styles.optionChipActive,
              ]}
              onPress={() => setCurrency(code)}
            >
              <Text style={[styles.optionChipText, currency === code && { color: '#FFF' }]}>
                {CURRENCIES[code as keyof typeof CURRENCIES].symbol} {code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 語言設定 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 語言設定</Text>
        <Text style={styles.sectionHint}>目前選擇：{languages.find((l) => l.key === language)?.label}</Text>
        <View style={styles.optionGrid}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.key}
              style={[
                styles.optionChip,
                language === lang.key && styles.optionChipActive,
              ]}
              onPress={() => setLanguage(lang.key)}
            >
              <Text style={[styles.optionChipText, language === lang.key && { color: '#FFF' }]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 資料匯出 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📤 資料匯出</Text>
        <View style={styles.exportRow}>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('csv')}>
            <Text style={styles.exportBtnText}>📊 匯出 CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('json')}>
            <Text style={styles.exportBtnText}>📋 匯出 JSON</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 關於 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ 關於</Text>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>開發者</Text>
          <Text style={styles.aboutValue}>MarketLedger Team</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>版本</Text>
          <Text style={styles.aboutValue}>1.0.0 (MVP)</Text>
        </View>
        <View style={styles.aboutItem}>
          <Text style={styles.aboutLabel}>技術棧</Text>
          <Text style={styles.aboutValue}>React Native + Expo + Zustand</Text>
        </View>
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
    gap: SPACING.xxl,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  appTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  appVersion: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  appDesc: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  sectionHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  exportRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  exportBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  exportBtnText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  aboutLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  aboutValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
});
