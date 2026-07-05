import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { CURRENCIES, CATEGORIES, PAYMENT_METHODS } from '../../src/constants';
import { CurrencyCode, LanguageCode } from '../../src/types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/colors';

/** 設定頁面 — 幣別、語言、匯出、清除資料 */
export default function SettingsPage() {
  const currency = useSettingsStore((s) => s.currency);
  const language = useSettingsStore((s) => s.language);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const transactions = useTransactionStore((s) => s.transactions);
  const clearAll = useTransactionStore((s) => s.clearAll);

  const languages: { key: LanguageCode; label: string }[] = [
    { key: 'zh_TW', label: '繁體中文' },
    { key: 'zh_CN', label: '簡體中文' },
    { key: 'en', label: 'English' },
    { key: 'th', label: 'ไทย' },
    { key: 'ms', label: 'Bahasa Melayu' },
  ];

  // 真正的 CSV 匯出
  const exportCSV = async () => {
    if (transactions.length === 0) {
      Alert.alert('匯出', '目前沒有交易記錄可以匯出');
      return;
    }
    const header = 'id,type,amount,currency,category,paymentMethod,note,marketId,createdAt\n';
    const rows = transactions.map((t) => {
      const cat = CATEGORIES.find((c) => c.id === t.category)?.label ?? t.category;
      const pay = t.paymentMethod ? PAYMENT_METHODS[t.paymentMethod]?.label : '';
      const note = (t.note ?? '').replace(/"/g, '""');
      return `"${t.id}","${t.type}",${t.amount},"${t.currency}","${cat}","${pay}","${note}","${t.marketId ?? ''}",${new Date(t.createdAt).toISOString()}`;
    }).join('\n');
    const csv = header + rows;

    try {
      const filename = FileSystem.documentDirectory + `marketledger_${Date.now()}.csv`;
      await FileSystem.writeAsStringAsync(filename, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filename, { mimeType: 'text/csv', dialogTitle: '匯出 CSV' });
      } else {
        Alert.alert('✓ 已匯出', `CSV 已儲存至 ${filename}`);
      }
    } catch (e) {
      Alert.alert('匯出失敗', String(e));
    }
  };

  // 真正的 JSON 匯出
  const exportJSON = async () => {
    if (transactions.length === 0) {
      Alert.alert('匯出', '目前沒有交易記錄可以匯出');
      return;
    }
    const json = JSON.stringify({
      exportedAt: new Date().toISOString(),
      count: transactions.length,
      transactions,
    }, null, 2);

    try {
      const filename = FileSystem.documentDirectory + `marketledger_${Date.now()}.json`;
      await FileSystem.writeAsStringAsync(filename, json, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filename, { mimeType: 'application/json', dialogTitle: '匯出 JSON' });
      } else {
        Alert.alert('✓ 已匯出', `JSON 已儲存至 ${filename}`);
      }
    } catch (e) {
      Alert.alert('匯出失敗', String(e));
    }
  };

  const handleClearData = () => {
    Alert.alert(
      '清除所有資料',
      `這將刪除所有 ${transactions.length} 筆交易記錄，且無法復原。確定嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: () => {
            clearAll();
            Alert.alert('✓ 已清除', '所有交易記錄已刪除');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* App 資訊 */}
        <View style={styles.appInfo}>
          <Text style={styles.appTitle}>MarketLedger</Text>
          <Text style={styles.appVersion}>v1.0.1 MVP</Text>
          <Text style={styles.appDesc}>全球市集攤販記帳工具</Text>
        </View>

        {/* 幣別設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💱 幣別設定</Text>
          <Text style={styles.sectionHint}>
            目前選擇：{CURRENCIES[currency].symbol} ({currency})
          </Text>
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
                  {CURRENCIES[code].symbol} {code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 語言設定（提示尚未實作） */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 語言設定</Text>
          <Text style={styles.sectionHint}>
            目前選擇：{languages.find((l) => l.key === language)?.label}
          </Text>
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
          <Text style={styles.hint}>※ 多語系介面將於 V2 版本提供</Text>
        </View>

        {/* 資料匯出 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 資料匯出</Text>
          <Text style={styles.sectionHint}>
            共 {transactions.length} 筆交易記錄
          </Text>
          <View style={styles.exportRow}>
            <TouchableOpacity style={styles.exportBtn} onPress={exportCSV}>
              <Text style={styles.exportBtnText}>📊 匯出 CSV</Text>
              <Text style={styles.exportBtnHint}>可用 Excel 開啟</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn} onPress={exportJSON}>
              <Text style={styles.exportBtnText}>📋 匯出 JSON</Text>
              <Text style={styles.exportBtnHint}>完整資料備份</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 危險區 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ 資料管理</Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
            <Text style={styles.dangerBtnText}>🗑️ 清除所有交易記錄</Text>
          </TouchableOpacity>
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
            <Text style={styles.aboutValue}>1.0.1 (MVP)</Text>
          </View>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>技術棧</Text>
            <Text style={styles.aboutValue}>React Native + Expo + Zustand</Text>
          </View>
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
  hint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
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
    gap: 4,
  },
  exportBtnText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  exportBtnHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  dangerBtn: {
    backgroundColor: COLORS.expense + '15',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.expense,
    alignItems: 'center',
  },
  dangerBtnText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.expense,
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
