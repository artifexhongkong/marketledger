import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useProductStore } from '../../src/stores/productStore';
import { useMarketStore } from '../../src/stores/marketStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { AmountInput } from '../../src/components/AmountInput';
import { CategoryChip } from '../../src/components/CategoryChip';
import {
  CATEGORIES,
  CURRENCIES,
  PAYMENT_METHODS,
  DEFAULT_MARKETS,
} from '../../src/constants';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
} from '../../src/constants/colors';
import {
  Transaction,
  TransactionType,
  CategoryId,
  PaymentMethod,
  CurrencyCode,
  Product,
} from '../../src/types';

/** 記帳頁面 — 快速記帳 + 商品管理 */
export default function ExpensePage() {
  const [mode, setMode] = React.useState<'record' | 'products'>('record');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
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

        {mode === 'record' ? <RecordView /> : <ProductsView />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────
// 記帳視圖
// ─────────────────────────────────────────────────────────────

function RecordView() {
  const currency = useSettingsStore((s) => s.currency);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const products = useProductStore((s) => s.products);
  const currentMarketId = useMarketStore((s) => s.currentMarketId);
  const markets = useMarketStore((s) => s.markets);
  const setCurrentMarket = useMarketStore((s) => s.setCurrentMarket);

  const [txType, setTxType] = React.useState<TransactionType>('expense');
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryId | ''>('');
  const [amountStr, setAmountStr] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('cash');
  const [note, setNote] = React.useState('');
  const [showMarketPicker, setShowMarketPicker] = React.useState(false);

  const filteredCategories = CATEGORIES.filter((c) => c.type === txType);
  const currentMarket = markets.find((m) => m.id === currentMarketId);

  // 切換收入/支出時清空分類
  const handleTypeSwitch = (type: TransactionType) => {
    if (type !== txType) {
      setTxType(type);
      setSelectedCategory('');
    }
  };

  // 商品快捷記帳（一鍵記錄該商品的銷售）
  const handleQuickProduct = (product: Product) => {
    addTransaction({
      type: 'income',
      amount: product.price,
      currency,
      category: 'sales',
      paymentMethod,
      productId: product.id,
      note: product.name,
      marketId: currentMarketId ?? undefined,
    });
    Alert.alert('✓ 已記錄', `${product.name} ${formatMoney(product.price, currency)}`);
  };

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
      currency,
      category: selectedCategory as CategoryId,
      paymentMethod,
      note: note.trim() || undefined,
      marketId: currentMarketId ?? undefined,
    });

    // 重置
    setAmountStr('');
    setSelectedCategory('');
    setNote('');
    Alert.alert(
      '✓ 已記錄',
      `${txType === 'income' ? '收入' : '支出'} ${formatMoney(amount, currency)} 已加入`
    );
  };

  return (
    <>
      {/* 商品快捷按鈕（收銀機風格） */}
      {products.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ 快速記帳（點商品即記錄銷售）</Text>
          <View style={styles.productGrid}>
            {products.slice(0, 8).map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.quickProductBtn}
                onPress={() => handleQuickProduct(p)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickProductName} numberOfLines={1}>{p.name}</Text>
                <Text style={styles.quickProductPrice}>{formatMoney(p.price, currency)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 收入 / 支出切換 */}
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[styles.typeBtn, txType === 'expense' && styles.typeBtnExpense]}
          onPress={() => handleTypeSwitch('expense')}
        >
          <Text style={[styles.typeBtnText, txType === 'expense' && { color: '#FFF' }]}>
            💸 支出
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, txType === 'income' && styles.typeBtnIncome]}
          onPress={() => handleTypeSwitch('income')}
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
          {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentChip,
                paymentMethod === method && styles.paymentChipActive,
              ]}
              onPress={() => setPaymentMethod(method)}
            >
              <Text style={[styles.paymentChipText, paymentMethod === method && { color: '#FFF' }]}>
                {PAYMENT_METHODS[method].icon} {PAYMENT_METHODS[method].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 市集選擇 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>市集</Text>
        <TouchableOpacity
          style={styles.marketPicker}
          onPress={() => setShowMarketPicker(true)}
        >
          <Text style={styles.marketPickerText}>
            {currentMarket ? `🏪 ${currentMarket.name}` : '🌐 不指定市集'}
          </Text>
          <Text style={styles.marketPickerArrow}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* 備註 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>備註（選填）</Text>
        <TextInput
          style={styles.noteInput}
          value={note}
          onChangeText={setNote}
          placeholder="例如：客人買兩份、補貨..."
          placeholderTextColor={COLORS.textTertiary}
          multiline
          maxLength={100}
        />
      </View>

      {/* 確認按鈕 */}
      <TouchableOpacity style={styles.recordBtn} onPress={handleRecord} activeOpacity={0.8}>
        <Text style={styles.recordBtnText}>✓ 完成記帳</Text>
      </TouchableOpacity>

      {/* 市集選擇 Modal */}
      <Modal visible={showMarketPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>選擇市集</Text>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  currentMarketId === null && styles.modalItemActive,
                ]}
                onPress={() => {
                  setCurrentMarket(null);
                  setShowMarketPicker(false);
                }}
              >
                <Text style={styles.modalItemText}>🌐 不指定市集</Text>
              </TouchableOpacity>
              {markets.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.modalItem,
                    currentMarketId === m.id && styles.modalItemActive,
                  ]}
                  onPress={() => {
                    setCurrentMarket(m.id);
                    setShowMarketPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>🏪 {m.name}</Text>
                  <Text style={styles.modalItemSub}>{m.location}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowMarketPicker(false)}
            >
              <Text style={styles.modalCloseText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 商品管理視圖
// ─────────────────────────────────────────────────────────────

function ProductsView() {
  const products = useProductStore((s) => s.products);
  const addProduct = useProductStore((s) => s.addProduct);
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const currency = useSettingsStore((s) => s.currency);

  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [unit, setUnit] = React.useState('個');
  const [category, setCategory] = React.useState<CategoryId>('sales');

  const handleAdd = () => {
    const p = parseFloat(price);
    if (!name.trim()) {
      Alert.alert('請輸入商品名稱');
      return;
    }
    if (!p || p <= 0) {
      Alert.alert('請輸入有效單價');
      return;
    }
    addProduct({
      name: name.trim(),
      price: p,
      unit: unit.trim() || '個',
      categoryId: category,
    });
    setName('');
    setPrice('');
    setUnit('個');
    setCategory('sales');
    setShowForm(false);
    Alert.alert('✓ 已新增', `${name.trim()} 已加入商品目錄`);
  };

  const handleDelete = (product: Product) => {
    Alert.alert('刪除商品', `確定要刪除「${product.name}」嗎？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: () => deleteProduct(product.id),
      },
    ]);
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

            {/* 名稱 */}
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>名稱</Text>
              <TextInput
                style={styles.formInput}
                value={name}
                onChangeText={setName}
                placeholder="例如：手作餅乾"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>

            {/* 單價 */}
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>單價</Text>
              <TextInput
                style={styles.formInput}
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="decimal-pad"
              />
            </View>

            {/* 單位 */}
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>單位</Text>
              <TextInput
                style={styles.formInput}
                value={unit}
                onChangeText={setUnit}
                placeholder="個 / 份 / 杯"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>

            {/* 分類 */}
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>分類</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryRow}>
                  {CATEGORIES.filter((c) => c.type === 'income').map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryMini,
                        category === cat.id && styles.categoryMiniActive,
                      ]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Text style={{ fontSize: 12 }}>
                        {cat.icon} {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={[styles.formActionBtn, styles.cancelBtn]}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formActionBtn, styles.saveBtn]}
                onPress={handleAdd}
              >
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
          <Text style={styles.emptySubtext}>點擊「新增商品」開始建立商品目錄{'\n'}建立後即可在記帳頁一鍵記錄銷售</Text>
        </View>
      ) : (
        <View style={styles.productList}>
          {products.map((p) => {
            const cat = CATEGORIES.find((c) => c.id === p.categoryId);
            return (
              <TouchableOpacity
                key={p.id}
                style={styles.productItem}
                onLongPress={() => handleDelete(p)}
                activeOpacity={0.7}
              >
                <View style={styles.productInfo}>
                  <Text style={styles.productEmoji}>{cat?.icon ?? '📦'}</Text>
                  <View>
                    <Text style={styles.productName}>{p.name}</Text>
                    <Text style={styles.productDetail}>
                      {formatMoney(p.price, currency)} / {p.unit}
                    </Text>
                  </View>
                </View>
                <Text style={styles.productHint}>長按刪除</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// 輔助函式
// ─────────────────────────────────────────────────────────────

function formatMoney(amount: number, currency: CurrencyCode): string {
  const { symbol } = CURRENCIES[currency];
  return `${symbol}${amount.toLocaleString()}`;
}

// ─────────────────────────────────────────────────────────────
// 樣式
// ─────────────────────────────────────────────────────────────

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
  // 商品快捷
  section: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickProductBtn: {
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minWidth: '47%',
    flexGrow: 1,
    alignItems: 'center',
  },
  quickProductName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  quickProductPrice: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginTop: 2,
  },
  // 收入/支出切換
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
  // 分類/支付捲動
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
  // 市集選擇
  marketPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  marketPickerText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  marketPickerArrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  // 備註
  noteInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    minHeight: 60,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    textAlignVertical: 'top',
  },
  // 確認按鈕
  recordBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  recordBtnText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: '#FFF',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalItemActive: {
    backgroundColor: COLORS.primary + '15',
  },
  modalItemText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.medium,
  },
  modalItemSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalClose: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  // 商品管理表單
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
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  categoryMini: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryMiniActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
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
    textAlign: 'center',
    lineHeight: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  productEmoji: {
    fontSize: 24,
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
  productHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
});
