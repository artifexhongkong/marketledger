import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useProductStore } from '../../src/stores/productStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { AmountInput } from '../../src/components/AmountInput';
import { CategoryChip } from '../../src/components/CategoryChip';
import { CATEGORIES, CURRENCIES } from '../../src/constants';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../src/constants/colors';

/** 記帳頁面 — 快速記帳 + 商品管理 */
export default function ExpensePage() {
  const [mode, setMode] = React.useState<'record' | 'products'>('record');
  const [txType, setTxType] = React.useState<'income' | 'expense'>('expense');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [amountStr, setAmountStr] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<string>('cash');
  const [note, setNote] = React.useState('');

  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const currency = useSettingsStore((s) => s.currency);

  // 篩選分類（依交易類型）
  const filteredCategories = CATEGORIES.filter((c) => c.type === txType);

  const handleRecord = () => {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) {
      Alert.alert('請輸入金額');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('請選擇分類');
      return;
    }

    addTransaction({
      type: txType,
      amount,
      currency: currency as any,
      category: selectedCategory as any,
      paymentMethod: paymentMethod as any,
      note: note || undefined,
    });

    // 重置
    setAmountStr('');
    setSelectedCategory('');
    setNote('');
    Alert.alert('✓ 已記錄', `${txType === 'income' ? '收入' : '支出'} ${amount} 已加入`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 模式切換 */}
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'record' && styles.modeBtnActive]}
          onPress={() => setMode('record')}
        >
          <Text style={[styles.modeBtnText, mode === 'record' && styles.modeBtnTextActive]}>
            ✏️ 快速記帳
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'products' && styles.modeBtnActive]}
          onPress={() => setMode('products')}
        >
          <Text style={[styles.modeBtnText, mode === 'products' && styles.modeBtnTextActive]}>
            📦 商品管理
          </Text>
        </TouchableOpacity>
      </View>

      {mode === 'record' ? (
        <>
          {/* 收入 / 支出切換 */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeBtn, txType === 'expense' && styles.typeBtnExpense]}
              onPress={() => setTxType('expense')}
            >
              <Text style={[styles.typeBtnText, txType === 'expense' && { color: '#FFF' }]}>
                💸 支出
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, txType === 'income' && styles.typeBtnIncome]}
              onPress={() => setTxType('income')}
            >
              <Text style={[styles.typeBtnText, txType === 'income' && { color: '#FFF' }]}>
                💰 收入
              </Text>
            </TouchableOpacity>
          </View>

          {/* 金額輸入 */}
          <AmountInput
            displayValue={amountStr}
            onAmountChange={setAmountStr}
            placeholder="0.00"
          />

          {/* 分類選擇 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>分類</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {filteredCategories.map((cat) => (
                <CategoryChip
                  key={cat.id}
                  category={cat}
                  selected={selectedCategory === cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* 支付方式 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>支付方式</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {Object.entries(CURRENCIES).map(([key]) => null)}
              {/* 簡化：顯示現金/電子支付 */}
              {['cash', 'payme', 'fps', 'alipayhk', 'wechat_pay'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentChip,
                    paymentMethod === method && styles.paymentChipActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={[styles.paymentChipText, paymentMethod === method && { color: '#FFF' }]}>
                    {method === 'cash' ? '💵 現金' : method === 'payme' ? '💳 PayMe' : method === 'fps' ? '⚡ FPS' : method === 'alipayhk' ? '🅰️ AlipayHK' : '💬 WeChat'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 備註 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>備註（選填）</Text>
            <View style={styles.noteInput}>
              <Text style={styles.noteText}>{note}</Text>
            </View>
          </View>

          {/* 確認按鈕 */}
          <TouchableOpacity style={styles.recordBtn} onPress={handleRecord} activeOpacity={0.8}>
            <Text style={styles.recordBtnText}>✓ 完成記帳</Text>
          </TouchableOpacity>
        </>
      ) : (
        <ProductsView />
      )}
    </ScrollView>
  );
}

/** 商品管理子視圖 */
function ProductsView() {
  const products = useProductStore((s) => s.products);
  const addProduct = useProductStore((s) => s.addProduct);
  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [unit, setUnit] = React.useState('個');

  const handleAdd = () => {
    const p = parseFloat(price);
    if (!name.trim() || !p || p <= 0) return;
    addProduct({ name: name.trim(), price: p, unit: unit.trim() || '個', categoryId: 'other' });
    setName('');
    setPrice('');
    setShowForm(false);
  };

  return (
    <View style={{ gap: SPACING.lg }}>
      <View style={styles.formCard}>
        {!showForm ? (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
            <Text style={styles.addBtnText}>+ 新增商品</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.formTitle}>新增商品</Text>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>名稱</Text>
              <View style={styles.formInput}>
                <Text style={styles.formInputText}>{name || '...'}</Text>
              </View>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>單價</Text>
              <View style={styles.formInput}>
                <Text style={styles.formInputText}>{price || '0'}</Text>
              </View>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>單位</Text>
              <View style={styles.formInput}>
                <Text style={styles.formInputText}>{unit}</Text>
              </View>
            </View>
            <View style={styles.formActions}>
              <TouchableOpacity style={[styles.formActionBtn, styles.cancelBtn]} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.formActionBtn, styles.saveBtn]} onPress={handleAdd}>
                <Text style={styles.saveText}>儲存</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyText}>尚無商品</Text>
          <Text style={styles.emptySubtext}>點擊「新增商品」開始建立商品目錄</Text>
        </View>
      ) : (
        <View style={styles.productList}>
          {products.map((p) => (
            <View key={p.id} style={styles.productItem}>
              <Text style={styles.productName}>{p.name}</Text>
              <Text style={styles.productDetail}>
                {p.price} / {p.unit}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeBtnText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  modeBtnTextActive: {
    color: '#FFF',
    fontWeight: FONT_WEIGHT.semibold,
  },
  typeToggle: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeBtnExpense: {
    backgroundColor: COLORS.expense,
    borderColor: COLORS.expense,
  },
  typeBtnIncome: {
    backgroundColor: COLORS.income,
    borderColor: COLORS.income,
  },
  typeBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  paymentChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  paymentChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  noteInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 60,
    padding: SPACING.md,
  },
  noteText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  recordBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  recordBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: '#FFF',
  },
  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addBtn: {
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  addBtnText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  formTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  formLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    width: 50,
  },
  formInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formInputText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  formActionBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.md,
  },
  saveText: {
    color: '#FFF',
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
  productList: {
    gap: SPACING.sm,
  },
  productItem: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  productName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  productDetail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
