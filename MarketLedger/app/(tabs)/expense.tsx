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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransactionStore } from '../../src/stores/transactionStore';
import { useProductStore } from '../../src/stores/productStore';
import { useMarketStore } from '../../src/stores/marketStore';
import { useSettingsStore } from '../../src/stores/settingsStore';
import { ProductButton } from '../../src/components/ProductButton';
import { AmountInput } from '../../src/components/AmountInput';
import { CategoryChip } from '../../src/components/CategoryChip';
import {
  CATEGORIES,
  PAYMENT_METHODS,
} from '../../src/constants';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZE,
  FONT_WEIGHT,
} from '../../src/constants/colors';
import {
  TransactionType,
  CategoryId,
  PaymentMethod,
} from '../../src/types';

/** 主要支付方式（前 5 個，置頂大按鈕） */
const TOP_PAYMENTS: PaymentMethod[] = ['cash', 'payme', 'fps', 'alipayhk', 'wechat_pay'];

/** 記帳頁面 */
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

function RecordView() {
  const router = useRouter();
  const { currency, products, currentMarketId, markets, addTransaction, setCurrentMarket } = useStores();
  const [payment, setPayment] = React.useState<PaymentMethod>('cash');
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [txType, setTxType] = React.useState<TransactionType>('expense');
  const [amount, setAmount] = React.useState('');
  const [category, setCategory] = React.useState<CategoryId | ''>('');
  const [note, setNote] = React.useState('');
  const [showMarketPicker, setShowMarketPicker] = React.useState(false);

  // Toast 狀態
  const [toast, setToast] = React.useState<{ txId: string; name: string; amount: number } | null>(null);
  const [lastTx, setLastTx] = React.useState<{ txId: string; name: string; amount: number } | null>(null);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const { deleteTransaction } = useTransactionStore();

  const currentMarket = markets.find((m) => m.id === currentMarketId);

  React.useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleRecorded = (txId: string, name: string, amount: number, qty: number) => {
    setToast({ txId, name, amount });
    setLastTx({ txId, name, amount });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  };

  const handleUndo = () => {
    if (!lastTx) return;
    deleteTransaction(lastTx.txId);
    setToast(null);
    setLastTx(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { Alert.alert('請輸入金額'); return; }
    if (!category) { Alert.alert('請選擇分類'); return; }
    addTransaction({
      type: txType,
      amount: amt,
      currency,
      category: category as CategoryId,
      paymentMethod: payment,
      note: note.trim() || undefined,
      marketId: currentMarketId || undefined,
    });
    setAmount('');
    setCategory('');
    setNote('');
    setShowAdvanced(false);
  };

  const paymentLabels: Record<string, string> = {
    cash: '現金', payme: 'PayMe', fps: 'FPS', alipayhk: 'AlipayHK', wechat_pay: 'WeChat',
  };

  return (
    <View style={styles.recordWrap}>
      {/* Toast */}
      {toast && (
        <View style={styles.toast}>
          <View style={styles.toastIcon}>
            <Text style={styles.toastCheck}>✓</Text>
          </View>
          <View style={styles.toastContent}>
            <Text style={styles.toastLabel}>已記錄銷售 · {paymentLabels[payment] || payment}</Text>
            <Text style={styles.toastText}>{toast.name} · {formatMoney(toast.amount, currency)}</Text>
          </View>
          <TouchableOpacity onPress={handleUndo} style={styles.toastUndo}>
            <Text style={styles.toastUndoText}>↩ 撤銷</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setToast(null)} style={styles.toastClose}>
            <Text style={styles.toastCloseText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 支付方式 — 5 大按鈕 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💳 支付方式</Text>
          <Text style={styles.sectionHint}>點選後套用至所有記帳</Text>
        </View>
        <View style={styles.paymentGrid}>
          {TOP_PAYMENTS.map((m) => {
            const active = payment === m;
            const info = PAYMENT_METHODS[m];
            return (
              <TouchableOpacity
                key={m}
                style={[styles.paymentBtn, active && styles.paymentBtnActive]}
                onPress={() => setPayment(m)}
              >
                <Text style={styles.paymentIcon}>{info.icon}</Text>
                <Text style={[styles.paymentLabel, active && styles.paymentLabelActive]}>
                  {paymentLabels[m] || info.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 商品快捷按鈕 */}
      {products.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚡ 點商品即記錄銷售</Text>
            <View style={styles.sectionHintRow}>
              <Text style={styles.sectionHint}>長按 ↑+1 ↓−1</Text>
              {lastTx && (
                <TouchableOpacity onPress={handleUndo}>
                  <Text style={styles.undoLink}>↩ 撤銷上筆</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.productGrid}>
            {products.map((p) => (
              <ProductButton
                key={p.id}
                product={p}
                payment={payment}
                currentMarketId={currentMarketId}
                onRecorded={handleRecorded}
              />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyProducts}>
          <Text style={styles.emptyProductsEmoji}>📦</Text>
          <Text style={styles.emptyProductsText}>尚無商品</Text>
          <Text style={styles.emptyProductsHint}>切換到「商品管理」建立商品目錄</Text>
        </View>
      )}

      {/* 手動記帳 */}
      <TouchableOpacity
        style={styles.advancedToggle}
        onPress={() => setShowAdvanced(!showAdvanced)}
      >
        <Text style={styles.advancedToggleText}>⚙️ 手動記帳（自訂金額 / 支出 / 分類）</Text>
        <Text style={styles.advancedToggleArrow}>{showAdvanced ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {showAdvanced && (
        <View style={styles.advancedCard}>
          {/* 收入/支出 */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeBtn, txType === 'expense' && styles.typeBtnExpense]}
              onPress={() => { setTxType('expense'); setCategory(''); }}
            >
              <Text style={[styles.typeBtnText, txType === 'expense' && styles.typeBtnTextActive]}>💸 支出</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, txType === 'income' && styles.typeBtnIncome]}
              onPress={() => { setTxType('income'); setCategory(''); }}
            >
              <Text style={[styles.typeBtnText, txType === 'income' && styles.typeBtnTextActive]}>💰 收入</Text>
            </TouchableOpacity>
          </View>

          {/* 金額 */}
          <Text style={styles.fieldLabel}>金額</Text>
          <AmountInput displayValue={amount} onAmountChange={setAmount} placeholder="0.00" />

          {/* 分類 */}
          <Text style={styles.fieldLabel}>分類</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {CATEGORIES.filter((c) => c.type === txType).map((c) => (
                <CategoryChip
                  key={c.id}
                  category={c}
                  selected={category === c.id}
                  onPress={() => setCategory(c.id)}
                />
              ))}
            </View>
          </ScrollView>

          {/* 市集 */}
          <Text style={styles.fieldLabel}>市集</Text>
          <TouchableOpacity
            style={styles.marketPicker}
            onPress={() => setShowMarketPicker(!showMarketPicker)}
          >
            <Text style={styles.marketPickerText}>
              {currentMarket ? `🏪 ${currentMarket.name}` : '🌐 不指定市集'}
            </Text>
            <Text style={styles.marketPickerArrow}>▼</Text>
          </TouchableOpacity>
          {showMarketPicker && (
            <View style={styles.marketList}>
              <TouchableOpacity
                style={styles.marketItem}
                onPress={() => { setCurrentMarket(null); setShowMarketPicker(false); }}
              >
                <Text style={styles.marketItemText}>🌐 不指定市集</Text>
              </TouchableOpacity>
              {markets.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.marketItem, currentMarketId === m.id && styles.marketItemActive]}
                  onPress={() => { setCurrentMarket(m.id); setShowMarketPicker(false); }}
                >
                  <Text style={styles.marketItemText}>🏪 {m.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 備註 */}
          <Text style={styles.fieldLabel}>備註（選填）</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="例如：客人買兩份..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            maxLength={100}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>✓ 完成記帳</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function ProductsView() {
  const { products, addProduct, deleteProduct } = useProductStore();
  const currency = useSettingsStore((s) => s.currency);
  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [unit, setUnit] = React.useState('個');

  const handleAdd = () => {
    const p = parseFloat(price);
    if (!name.trim()) { Alert.alert('請輸入商品名稱'); return; }
    if (!p || p <= 0) { Alert.alert('請輸入有效單價'); return; }
    addProduct({ name: name.trim(), price: p, unit: unit.trim() || '個', categoryId: 'sales' });
    setName(''); setPrice(''); setUnit('個'); setShowForm(false);
  };

  return (
    <View style={{ gap: SPACING.lg }}>
      {!showForm ? (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+ 新增商品</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>新增商品</Text>
          <TextInput
            style={styles.formInput}
            placeholder="商品名稱"
            placeholderTextColor={COLORS.textTertiary}
            value={name}
            onChangeText={setName}
          />
          <View style={styles.formRow}>
            <TextInput
              style={[styles.formInput, { flex: 1 }]}
              placeholder="單價"
              placeholderTextColor={COLORS.textTertiary}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.formInput, { width: 80, marginLeft: SPACING.sm }]}
              placeholder="單位"
              placeholderTextColor={COLORS.textTertiary}
              value={unit}
              onChangeText={setUnit}
            />
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity style={[styles.formActionBtn, styles.cancelBtn]} onPress={() => setShowForm(false)}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.formActionBtn, styles.saveBtn]} onPress={handleAdd}>
              <Text style={styles.saveText}>儲存</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {products.length === 0 ? (
        <View style={styles.emptyProducts}>
          <Text style={styles.emptyProductsEmoji}>📦</Text>
          <Text style={styles.emptyProductsText}>尚無商品</Text>
          <Text style={styles.emptyProductsHint}>建立商品後即可一鍵記錄銷售</Text>
        </View>
      ) : (
        <View style={{ gap: SPACING.sm }}>
          {products.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.productItem}
              onPress={() => {
                Alert.alert('刪除商品', `確定要刪除「${p.name}」嗎？`, [
                  { text: '取消', style: 'cancel' },
                  { text: '刪除', style: 'destructive', onPress: () => deleteProduct(p.id) },
                ]);
              }}
            >
              <View>
                <Text style={styles.productItemName}>{p.name}</Text>
                <Text style={styles.productItemPrice}>{formatMoney(p.price, currency)} / {p.unit}</Text>
              </View>
              <Text style={styles.productItemHint}>點擊刪除</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Helpers ──

function useStores() {
  const currency = useSettingsStore((s) => s.currency);
  const products = useProductStore((s) => s.products);
  const currentMarketId = useMarketStore((s) => s.currentMarketId);
  const markets = useMarketStore((s) => s.markets);
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const setCurrentMarket = useMarketStore((s) => s.setCurrentMarket);
  return { currency, products, currentMarketId, markets, addTransaction, setCurrentMarket };
}

function formatMoney(amount: number, currency: string): string {
  const symbols: Record<string, string> = { HKD: 'HK$', TWD: 'NT$', THB: '฿', MYR: 'RM', SGD: 'S$', USD: 'US$' };
  return `${symbols[currency] || ''}${amount.toLocaleString()}`;
}

// ── Styles ──

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xxl },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.muted,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  modeBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.sm, alignItems: 'center' },
  modeBtnActive: { backgroundColor: COLORS.card, shadowColor: COLORS.shadow, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  modeBtnText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, fontWeight: '500' },
  modeBtnTextActive: { color: COLORS.text, fontWeight: '600' },
  recordWrap: { gap: SPACING.lg },
  // Toast
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.income + '60',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  toastIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.incomeBg,
    alignItems: 'center', justifyContent: 'center',
  },
  toastCheck: { color: COLORS.income, fontSize: 16, fontWeight: 'bold' },
  toastContent: { flex: 1 },
  toastLabel: { fontSize: 10, color: COLORS.textSecondary },
  toastText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text, marginTop: 1 },
  toastUndo: { paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm },
  toastUndoText: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.primary },
  toastClose: { padding: SPACING.xs },
  toastCloseText: { color: COLORS.textSecondary, fontSize: 14 },
  // Section
  section: { gap: SPACING.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  sectionHint: { fontSize: 10, color: COLORS.textTertiary },
  sectionHintRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  undoLink: { fontSize: 10, fontWeight: '600', color: COLORS.primary },
  // 支付方式
  paymentGrid: { flexDirection: 'row', gap: SPACING.xs + 2 },
  paymentBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    gap: 2,
  },
  paymentBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  paymentIcon: { fontSize: 18 },
  paymentLabel: { fontSize: 10, fontWeight: '500', color: COLORS.textSecondary },
  paymentLabelActive: { color: COLORS.textInverse, fontWeight: '600' },
  // 商品網格
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  emptyProducts: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.muted,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
  },
  emptyProductsEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  emptyProductsText: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  emptyProductsHint: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 4 },
  // 手動記帳
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.muted,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  advancedToggleText: { fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text },
  advancedToggleArrow: { fontSize: 12, color: COLORS.textSecondary },
  advancedCard: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
  },
  typeToggle: { flexDirection: 'row', gap: SPACING.sm },
  typeBtn: {
    flex: 1, paddingVertical: SPACING.sm + 2, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.muted, alignItems: 'center',
  },
  typeBtnExpense: { backgroundColor: COLORS.expense },
  typeBtnIncome: { backgroundColor: COLORS.income },
  typeBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary },
  typeBtnTextActive: { color: '#FFFFFF' },
  fieldLabel: { fontSize: FONT_SIZE.xs, fontWeight: '500', color: COLORS.textSecondary },
  chipRow: { flexDirection: 'row', gap: SPACING.xs },
  marketPicker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    borderWidth: 1, borderColor: COLORS.border,
  },
  marketPickerText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  marketPickerArrow: { fontSize: 10, color: COLORS.textSecondary },
  marketList: {
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1, borderColor: COLORS.border, maxHeight: 200,
  },
  marketItem: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  marketItemActive: { backgroundColor: COLORS.primary + '10' },
  marketItemText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  noteInput: {
    backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border, minHeight: 50,
    fontSize: FONT_SIZE.sm, color: COLORS.text, textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.xs,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: FONT_SIZE.md, fontWeight: '600' },
  // 商品管理表單
  addBtn: {
    paddingVertical: SPACING.md, alignItems: 'center',
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
  },
  addBtnText: { color: COLORS.primary, fontSize: FONT_SIZE.md, fontWeight: '600' },
  formCard: {
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm,
  },
  formTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  formRow: { flexDirection: 'row' },
  formInput: {
    backgroundColor: COLORS.background, borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
    fontSize: FONT_SIZE.md, color: COLORS.text,
  },
  formActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  formActionBtn: { flex: 1, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.sm, alignItems: 'center' },
  cancelBtn: { backgroundColor: COLORS.muted, borderWidth: 1, borderColor: COLORS.border },
  saveBtn: { backgroundColor: COLORS.primary },
  cancelText: { color: COLORS.textSecondary, fontSize: FONT_SIZE.md },
  saveText: { color: '#FFFFFF', fontSize: FONT_SIZE.md, fontWeight: '600' },
  productItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderWidth: 1, borderColor: COLORS.borderLight,
  },
  productItemName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  productItemPrice: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  productItemHint: { fontSize: 10, color: COLORS.textTertiary },
});
