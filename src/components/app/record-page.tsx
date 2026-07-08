"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore, CATEGORIES, PAYMENT_METHODS, PAYMENT_CATEGORIES, CURRENCIES, formatCurrency, getPaymentMethodInfo } from "@/lib/store";
import { haptic } from "@/lib/haptic";
import { useT } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Store, X, ChevronDown, Undo2, Check, RotateCcw, SlidersHorizontal, LayoutGrid, List, Trash2, Pencil } from "lucide-react";
import type { TransactionType, CategoryId, PaymentMethod, Product, CurrencyCode } from "@/lib/store";

export function RecordPage() {
  const t = useT();
  const [mode, setMode] = useState<"record" | "products">("record");
  return (
    <div className="pb-4 flex flex-col h-full">
      <h1 className="text-xl font-bold pt-4 px-4 text-foreground">{t.record_title}</h1>

      {/* Mode toggle — segmented control */}
      <div className="mx-4 mt-2 flex bg-muted rounded-lg p-0.5">
        <button onClick={() => setMode("record")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${mode === "record" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
          {t.record_title}
        </button>
        <button onClick={() => setMode("products")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${mode === "products" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
          {t.products_title}
        </button>
      </div>

      <div className="flex-1 mt-3">
        {mode === "record" ? <RecordView /> : <ProductsView />}
      </div>
    </div>
  );
}

// ── 主要t.record_payment_method（前 5 個，置頂大按鈕，不滑動）──
const TOP_PAYMENTS: PaymentMethod[] = ["cash", "payme", "fps", "alipayhk", "wechat_pay"];

// 商品按鈕顏色選項（用於視覺分組）
const PRODUCT_COLORS = [
  "#FEE2E2", // 淺紅
  "#FED7AA", // 橘
  "#FEF3C7", // 黃
  "#D1FAE5", // 綠
  "#DBEAFE", // 藍
  "#E9D5FF", // 紫
  "#FCE7F3", // 粉
  "#E5E7EB", // 灰
];

// 擴充色板 — 點「+」按鈕展開，直觀選色（不用 HSV slider）
// 8 系顏色 × 6 深淺 = 48 色 + 6 灰階
const EXTENDED_COLORS: string[] = [];
// 8 系飽和色（每系 6 個深淺）
const COLOR_FAMILIES: { name: string; hues: string[] }[] = [
  { name: "紅", hues: ["#FECACA", "#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#991B1B"] },
  { name: "橘", hues: ["#FED7AA", "#FDBA74", "#FB923C", "#F97316", "#EA580C", "#9A3412"] },
  { name: "黃", hues: ["#FEF08A", "#FDE047", "#FACC15", "#EAB308", "#CA8A04", "#854D0E"] },
  { name: "綠", hues: ["#BBF7D0", "#86EFAC", "#4ADE80", "#22C55E", "#16A34A", "#166534"] },
  { name: "藍", hues: ["#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1E40AF"] },
  { name: "紫", hues: ["#DDD6FE", "#C4B5FD", "#A78BFA", "#8B5CF6", "#7C3AED", "#5B21B6"] },
  { name: "粉", hues: ["#FBCFE8", "#F9A8D4", "#F472B6", "#EC4899", "#DB2777", "#9D174D"] },
  { name: "青", hues: ["#A5F3FC", "#67E8F9", "#22D3EE", "#06B6D4", "#0891B2", "#155E75"] },
];
COLOR_FAMILIES.forEach((f) => EXTENDED_COLORS.push(...f.hues));
// 灰階 6 階
const GRAYSCALE = ["#F3F4F6", "#D1D5DB", "#9CA3AF", "#6B7280", "#374151", "#111827"];

// ── Toast 通知型別 ──
interface ToastState {
  id: string;
  txId: string;
  productName: string;
  amount: number;
  currency: CurrencyCode;
  timestamp: number;
}

function RecordView() {
  const t = useT();
  const { currency, products, currentMarketId, markets, addTransaction, setCurrentMarket, deleteTransaction, customPaymentMethods, currentOrder, addOrderItem, removeOrderItem, updateOrderItemQty, updateOrderItemNote, clearOrder, generateOrderId } = useAppStore();
  const [payment, setPayment] = useState<PaymentMethod>("cash");

  // 取得支付方式標籤（支援自訂，使用 i18n）
  const getPaymentMethodLabel = (m: PaymentMethod): string => {
    const info = getPaymentMethodInfo(m, customPaymentMethods);
    // 內建支付方式用 i18n key 解析；自訂支付方式直接用 label
    if (m.toString().startsWith("custom_")) return info.label;
    return (t as any)[info.labelKey] || info.label;
  };
  const [showAdvanced, setShowAdvanced] = useState(false);
  // 手動t.record_title欄位
  const [txType, setTxType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId>("misc");
  const [note, setNote] = useState("");
  const [showMarketPicker, setShowMarketPicker] = useState(false);

  // ── 點擊回饋相關 state ──
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lastTx, setLastTx] = useState<{ txId: string; productName: string; amount: number } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 修改數量的訂單項目 ID
  const [editingOrderItem, setEditingOrderItem] = useState<string | null>(null);
  const [editQtyValue, setEditQtyValue] = useState("");
  const [editNoteValue, setEditNoteValue] = useState("");

  const currentMarket = markets.find((m) => m.id === currentMarketId);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleQuickProduct = (p: { id: string; name: string; price: number }) => {
    const orderId = generateOrderId();
    const txId = addTransaction({
      type: "income",
      amount: p.price,
      currency,
      category: "sales",
      paymentMethod: payment,
      productId: p.id,
      note: p.name,
      marketId: currentMarketId || undefined,
      orderId,
    });

    // 單筆記錄也震動（success 回饋）
    haptic("success");

    // 加到當前訂單清單
    addOrderItem(txId, p, 1);

    setConfirmId(p.id);
    setTimeout(() => setConfirmId(null), 600);

    const toastData: ToastState = {
      id: `toast_${Date.now()}`,
      txId,
      productName: p.name,
      amount: p.price,
      currency,
      timestamp: Date.now(),
    };
    setToast(toastData);
    setLastTx({ txId, productName: p.name, amount: p.price });

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

  const handleDismissToast = () => {
    setToast(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert(t.record_amount_required);
    addTransaction({
      type: txType,
      amount: amt,
      currency,
      category: category as CategoryId,
      paymentMethod: payment,
      note: note.trim() || undefined,
      marketId: currentMarketId || undefined,
    });
    setAmount("");
    setNote("");
    setShowAdvanced(false);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Toast 通知 — fixed 定位，浮在頁面之上不影響排版 */}
      {toast && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-14 toast-slide-down pointer-events-none">
          <div className="bg-card border border-emerald-200 shadow-lg rounded-2xl px-3 py-2.5 flex items-center gap-2.5 max-w-sm pointer-events-auto">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground leading-tight">{t.record_tap_to_record} · {getPaymentMethodLabel(payment)}</p>
              <p className="text-xs font-semibold text-foreground truncate leading-tight mt-0.5">
                {toast.productName} · {formatCurrency(toast.amount, currency)}
              </p>
            </div>
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 px-2 py-1.5 rounded-lg hover:bg-primary/8 transition flex-shrink-0"
            >
              <Undo2 className="w-3.5 h-3.5" />
              {t.record_undo}
            </button>
            <button
              onClick={handleDismissToast}
              className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0"
              aria-label={t.record_close_notification}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="px-4 flex-1 overflow-y-auto">
        {/* ── 1. 支付方式 ── */}
        <PaymentSelector payment={payment} setPayment={setPayment} />

        {/* ── 2. 商品快捷按鈕 ── */}
        {products.length > 0 ? (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">{t.record_tap_to_record}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/70">{t.record_long_press_hint}</span>
                {lastTx && (
                  <button
                    onClick={handleUndo}
                    className="text-[10px] text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t.record_undo_last}
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {products.map((p) => (
                <ProductButton
                  key={p.id}
                  product={p}
                  currency={currency}
                  payment={payment}
                  currentMarketId={currentMarketId}
                  confirming={confirmId === p.id}
                  onConfirm={(id) => { setConfirmId(id); setTimeout(() => setConfirmId(null), 600); }}
                  onRecord={(txId, productName, amount, qty) => {
                    setToast({
                      id: `toast_${Date.now()}`,
                      txId,
                      productName,
                      amount,
                      currency,
                      timestamp: Date.now(),
                    });
                    setLastTx({ txId, productName, amount });
                    // 加到當前訂單清單
                    addOrderItem(txId, p, qty);
                    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
                  }}
                  onUndo={handleUndo}
                  generateOrderId={generateOrderId}
                />
              ))}
            </div>
            {/* 訂單清單 — 顯示這一單已點的商品 + 合計 */}
            {currentOrder.length > 0 && (
              <div className="mt-2 bg-card border border-border rounded-xl overflow-hidden">
                {/* 清單標題 + 新一單按鈕 */}
                <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-foreground">{t.record_order_details}</span>
                    <span className="text-[10px] text-muted-foreground">({currentOrder.length} 項)</span>
                  </div>
                  <button
                    onClick={() => {
                        clearOrder();
                        haptic("tap");
                    }}
                    className="flex items-center gap-1 text-[10px] text-accent hover:text-foreground px-2 py-1 rounded-md hover:bg-accent/10 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t.record_new_order}
                  </button>
                </div>
                {/* 訂單項目列表 */}
                <div className="divide-y divide-border max-h-[200px] overflow-y-auto">
                  {currentOrder.map((item) => (
                    <div key={item.orderItemId} className="px-3 py-2 flex items-center gap-2">
                      {/* 商品色標 */}
                      {item.color && (
                        <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      )}
                      {/* 商品名 + 數量 + 備註 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatCurrency(item.price, currency)} × {item.qty}
                        </p>
                        {item.note && (
                          <p className="text-[10px] text-accent truncate mt-0.5">📝 {item.note}</p>
                        )}
                      </div>
                      {/* 小計 */}
                      <span className="text-xs font-bold tabular-nums text-primary flex-shrink-0">
                        {formatCurrency(item.price * item.qty, currency)}
                      </span>
                      {/* 撤銷按鈕 */}
                      <button
                        onClick={() => {
                          removeOrderItem(item.orderItemId);
                          haptic("warning");
                        }}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-rose-500 hover:bg-rose-50 transition flex-shrink-0"
                        aria-label="撤銷"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {/* 修改按鈕 */}
                      <button
                        onClick={() => {
                          setEditingOrderItem(item.orderItemId);
                          setEditQtyValue(String(item.qty));
                          setEditNoteValue(item.note || "");
                        }}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-accent hover:bg-accent/10 transition flex-shrink-0"
                        aria-label="修改數量"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {/* 合計 */}
                <div className="px-3 py-2 bg-primary/5 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground">{t.total}</span>
                  <span className="text-base font-bold tabular-nums text-primary">
                    {formatCurrency(currentOrder.reduce((sum, item) => sum + item.price * item.qty, 0), currency)}
                  </span>
                </div>
              </div>
            )}

            {/* 修改數量 + 備註 Modal */}
            {editingOrderItem && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setEditingOrderItem(null)}>
                <div className="bg-card rounded-xl p-4 w-full max-w-[280px] space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">{t.record_modify_item}</h4>
                    <button onClick={() => setEditingOrderItem(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {(() => {
                    const item = currentOrder.find((i) => i.orderItemId === editingOrderItem);
                    if (!item) return null;
                    const qty = parseInt(editQtyValue) || 0;
                    return (
                      <>
                        <p className="text-xs font-medium text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{t.record_unit_price} {formatCurrency(item.price, currency)}</p>
                        {/* 數量 */}
                        <div>
                          <label className="text-[11px] text-muted-foreground mb-1 block">{t.record_qty}</label>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={editQtyValue}
                            onChange={(e) => setEditQtyValue(e.target.value.replace(/[^0-9]/g, ""))}
                            autoFocus
                            className="bg-background text-center text-lg font-bold h-10"
                          />
                        </div>
                        {/* 備註 */}
                        <div>
                          <label className="text-[11px] text-muted-foreground mb-1 block">{t.record_note_optional}</label>
                          <Textarea
                            value={editNoteValue}
                            onChange={(e) => setEditNoteValue(e.target.value)}
                            placeholder="例如：客人要求、客製化、不加蔥…"
                            className="bg-background text-xs min-h-[50px] resize-none"
                            maxLength={100}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground text-center">
                          {t.subtotal}：{formatCurrency(item.price * qty, currency)}
                        </p>
                        <Button
                          onClick={() => {
                            if (qty > 0) {
                              updateOrderItemQty(editingOrderItem, qty);
                              updateOrderItemNote(editingOrderItem, editNoteValue);
                              haptic("tap");
                            }
                            setEditingOrderItem(null);
                          }}
                          className="w-full h-9"
                        >
                          {t.record_confirm}
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 bg-muted/50 rounded-xl p-6 text-center border border-dashed border-border">
            <p className="text-2xl mb-1">📦</p>
            <p className="text-sm font-medium text-foreground">{t.record_no_products}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.record_create_products}</p>
          </div>
        )}

        {/* ── 3. 手動記帳：可收合的進階區塊 ── */}
        <div className="mt-5">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full bg-muted/60 rounded-xl px-4 py-3 flex items-center justify-between text-sm font-medium text-foreground hover:bg-muted transition"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              {t.record_manual_entry}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition ${showAdvanced ? "rotate-180" : ""}`} />
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-4 p-4 bg-card border border-border rounded-xl">
              {/* 收入/支出切換 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setTxType("expense"); setCategory("misc"); }}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                    txType === "expense" ? "bg-rose-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.record_expense}
                </button>
                <button
                  onClick={() => { setTxType("income"); setCategory("sales"); }}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                    txType === "income" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.record_income}
                </button>
              </div>

              {/* 金額 */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">{t.record_amount}</p>
                <div className="bg-background border border-border rounded-lg flex items-center px-3 h-12">
                  <span className="text-base text-muted-foreground mr-2">{CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol || "$"}</span>
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    type="decimal"
                    inputMode="decimal"
                    className="border-0 bg-transparent text-xl font-bold p-0 h-auto focus-visible:ring-0 tabular-nums"
                  />
                </div>
              </div>

              {/* 分類 */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">{t.record_category}</p>
                <div className="flex gap-1.5 flex-wrap">
                  {CATEGORIES.filter((c) => c.type === txType).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                        category === c.id
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border bg-background text-foreground"
                      }`}
                    >
                      <span>{c.icon}</span>
                      {(t as any)[c.labelKey] || c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 市集 */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">{t.record_market}</p>
                <button
                  onClick={() => setShowMarketPicker(!showMarketPicker)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    {currentMarket ? currentMarket.name : t.record_no_market}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                {showMarketPicker && (
                  <Card className="mt-2 p-2 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => { setCurrentMarket(null); setShowMarketPicker(false); }}
                      className="w-full text-left p-2 hover:bg-muted rounded-lg text-sm"
                    >
                      {t.record_no_market}
                    </button>
                    {markets.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setCurrentMarket(m.id); setShowMarketPicker(false); }}
                        className={`w-full text-left p-2 hover:bg-muted rounded-lg text-sm ${
                          currentMarketId === m.id ? "bg-primary/8 text-primary font-medium" : ""
                        }`}
                      >
                        🏪 {m.name}
                      </button>
                    ))}
                  </Card>
                )}
              </div>

              {/* 備註 */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">{t.record_note_optional}</p>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="例如：客人買兩份、補貨..."
                  className="bg-background resize-none min-h-[50px] text-sm"
                  maxLength={100}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full h-11 font-semibold">
                {t.record_complete}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 動畫樣式 — Toast 從上方滑入，不偏左 */}
      <style jsx>{`
        :global(.toast-slide-down) {
          animation: toastSlideDown 0.3s ease-out;
        }
        :global(.toast-fade-in) {
          animation: toastFadeIn 0.2s ease-out;
        }
        @keyframes toastSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── 支付方式選擇器 ──

const PAYMENT_ICONS = ["💵", "💳", "⚡", "💬", "🅰️", "🟢", "🔵", "🟡", "📱", "🏦", "💸", "💰", "🎁", "✅", "📌", "🎯"];
const PAYMENT_COLORS = ["#1A1D24", "#059669", "#E11D48", "#F59E0B", "#7C3AED", "#0891B2", "#DB2777", "#65A30D", "#6B7280"];

function PaymentSelector({
  payment,
  setPayment,
}: {
  payment: PaymentMethod;
  setPayment: (p: PaymentMethod) => void;
}) {
  const t = useT();
  const { customPaymentMethods, addCustomPaymentMethod, deleteCustomPaymentMethod, visiblePayments, togglePaymentVisibility, reorderVisiblePayments } = useAppStore();
  const [showMore, setShowMore] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageMode, setShowManageMode] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState(false);
  const sortTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getPaymentInfo = (m: PaymentMethod): { label: string; icon: string; shortLabel: string; color: string } => {
    if (m.startsWith("custom_")) {
      const custom = customPaymentMethods.find((c) => `custom_${c.id}` === m);
      if (custom) return { label: custom.label, icon: custom.icon, shortLabel: custom.label.slice(0, 2).toUpperCase(), color: "#6B7280" };
    }
    const info = PAYMENT_METHODS[m as keyof typeof PAYMENT_METHODS];
    // 用 i18n 解析內建支付方式 label
    const localizedLabel = info && (t as any)[info.labelKey] ? (t as any)[info.labelKey] : (info?.label || m);
    return { label: localizedLabel, icon: info?.icon || "💳", shortLabel: info?.shortLabel || "?", color: info?.color || "#6B7280" };
  };

  const shortLabel = (label: string) => {
    // 短顯示：截斷為 2-4 字元
    return label.length > 4 ? label.slice(0, 4) : label;
  };

  const allBuiltinPayments = PAYMENT_CATEGORIES.flatMap((c) => c.payments);
  const visibleBuiltin = visiblePayments.filter((p) => !p.startsWith("custom_"));
  const visibleCustom = customPaymentMethods.filter((c) => visiblePayments.includes(`custom_${c.id}`));

  // 拖拽排序
  const handleDragStart = (index: number) => { if (sortMode) setDragIndex(index); };
  const handleDragOver = (e: React.DragEvent, index: number) => { if (sortMode) { e.preventDefault(); setDragOverIndex(index); } };
  const handleDrop = (index: number) => {
    if (sortMode && dragIndex !== null && dragIndex !== index) reorderVisiblePayments(dragIndex, index);
    setDragIndex(null); setDragOverIndex(null);
  };

  // 長按進入排序模式
  const handleSortLongPress = () => {
    sortTimerRef.current = setTimeout(() => {
      setSortMode(true);
      haptic("tap");
    }, 500);
  };
  const handleSortPressEnd = () => {
    if (sortTimerRef.current) { clearTimeout(sortTimerRef.current); sortTimerRef.current = null; }
  };

  // 點擊空白處退出排序
  const handleSortAreaClick = (e: React.MouseEvent) => {
    if (sortMode) {
      // 如果點到的不是t.record_payment_method按鈕本身，退出排序
      const target = e.target as HTMLElement;
      if (!target.closest('[data-pay-index]')) {
        setSortMode(false);
        setDragIndex(null);
        setDragOverIndex(null);
      }
    }
  };

  // 拖拽中即時重排（接近其他圖標時讓位）
  const handleDragOverLive = (e: React.DragEvent, index: number) => {
    if (!sortMode || dragIndex === null || dragIndex === index) return;
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
      // 即時重排：把拖拽中的項目移到當前位置
      reorderVisiblePayments(dragIndex, index);
      // 更新 dragIndex 為新位置
      setDragIndex(index);
    }
  };

  return (
    <div className="mt-3" onClick={handleSortAreaClick}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground font-medium">{t.record_payment_method}</p>
        {!sortMode && <p className="text-[10px] text-muted-foreground/50">{t.record_sort_hint}</p>}
        {sortMode && <p className="text-[10px] text-accent/70">{t.record_sorting}</p>}
      </div>

      {/* 主頁t.record_payment_method */}
      <div className="grid grid-cols-5 gap-1.5"
        onPointerDown={handleSortLongPress}
        onPointerUp={handleSortPressEnd}
        onPointerLeave={handleSortPressEnd}>
        {visibleBuiltin.map((m) => {
          const info = getPaymentInfo(m as PaymentMethod);
          const active = payment === m;
          const vi = visiblePayments.indexOf(m);
          return (
            <div key={m} data-pay-index={vi}
              draggable={sortMode}
              onDragStart={() => { if (sortMode) setDragIndex(vi); }}
              onDragOver={(e) => handleDragOverLive(e, vi)}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
              className={`relative transition-all duration-200 ease-out ${dragIndex === vi ? "opacity-30 scale-90" : ""} ${sortMode ? "cursor-move" : ""}`}>
              <PaymentButton2 icon={info.icon} label={shortLabel(info.label)} active={active}
                manageMode={false} onClick={() => !sortMode && !showMore && setPayment(m as PaymentMethod)} onDelete={null} />
              {showMore && !sortMode && (
                <button onClick={(e) => { e.stopPropagation(); togglePaymentVisibility(m); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm z-10 animate-[fadeIn_0.15s_ease-out] text-[13px] leading-none font-bold pb-0.5">
                  −
                </button>
              )}
            </div>
          );
        })}
        {visibleCustom.map((c) => {
          const m = `custom_${c.id}` as PaymentMethod;
          const active = payment === m;
          const vi = visiblePayments.indexOf(m);
          return (
            <div key={c.id} data-pay-index={vi}
              draggable={sortMode}
              onDragStart={() => { if (sortMode) setDragIndex(vi); }}
              onDragOver={(e) => handleDragOverLive(e, vi)}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
              className={`relative transition-all duration-200 ease-out ${dragIndex === vi ? "opacity-30 scale-90" : ""} ${sortMode ? "cursor-move" : ""}`}>
              <PaymentButton2 icon={c.icon} label={shortLabel(c.label)} active={active}
                manageMode={sortMode} onClick={() => !sortMode && !showMore && setPayment(m)}
                onDelete={() => { if (confirm(`${t.delete}？`)) { deleteCustomPaymentMethod(c.id); if (payment === m) setPayment("cash"); } }} />
              {showMore && !sortMode && (
                <button onClick={(e) => { e.stopPropagation(); togglePaymentVisibility(`custom_${c.id}`); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm z-10 animate-[fadeIn_0.15s_ease-out] text-[13px] leading-none font-bold pb-0.5">
                  −
                </button>
              )}
            </div>
          );
        })}
        {/* 更多按鈕 — 跟通用按鈕同大小同樣式 */}
        <PaymentButton2
          icon="🌐"
          label={t.common_more}
          active={showMore}
          manageMode={false}
          onClick={() => setShowMore(!showMore)}
          onDelete={null}
        />
      </div>

      {/* 更多展開 — 只顯示還沒在主頁的t.record_payment_method，點擊即添加 */}
      {showMore && (
        <div className="mt-2 animate-[fadeIn_0.2s_ease-out]">
          {(() => {
            // 收集所有未顯示的t.record_payment_method
            const hidden: { m: string; info: { label: string; icon: string; shortLabel: string; color: string } }[] = [];
            PAYMENT_CATEGORIES.forEach((cat) => {
              cat.payments.forEach((m) => {
                if (!visiblePayments.includes(m)) {
                  const info = PAYMENT_METHODS[m as keyof typeof PAYMENT_METHODS];
                  const localizedLabel = info && (t as any)[info.labelKey] ? (t as any)[info.labelKey] : (info?.label || m);
                  hidden.push({ m, info: { label: localizedLabel, icon: info?.icon || "💳", shortLabel: info?.shortLabel || "?", color: info?.color || "#6B7280" } });
                }
              });
            });
            customPaymentMethods.forEach((c) => {
              const m = `custom_${c.id}`;
              if (!visiblePayments.includes(m)) {
                hidden.push({ m, info: { label: c.label, icon: c.icon, shortLabel: c.label.slice(0, 2).toUpperCase(), color: "#6B7280" } });
              }
            });

            if (hidden.length === 0) {
              return (
                <div className="text-center py-3 text-[11px] text-muted-foreground">
                  {t.record_payment_method}
                </div>
              );
            }

            return (
              <div className="grid grid-cols-5 gap-1.5">
                {hidden.map(({ m, info }) => {
                  const active = payment === (m as PaymentMethod);
                  return (
                    <PaymentButton2
                      key={m}
                      icon={info.icon}
                      label={shortLabel(info.label)}
                      active={active}
                      manageMode={false}
                      noActiveStyle // 備用t.record_payment_method不顯示 active 樣式，保持原色
                      // 點擊圖示只添加到主頁，不自動選中（避免變色）
                      onClick={() => {
                        togglePaymentVisibility(m);
                      }}
                      onDelete={null}
                    />
                  );
                })}
                {/* 新增自訂支付 */}
                <button onClick={() => setShowAddModal(true)}
                  className="flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 text-accent hover:bg-accent/10 transition select-none">
                  <Plus className="w-4 h-4" />
                  <span className="text-[10px] font-medium">{t.markets_add}</span>
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* 新增t.record_payment_method Modal */}
      {showAddModal && (
        <AddPaymentModal onClose={() => setShowAddModal(false)}
          onAdd={(label, icon, color) => { addCustomPaymentMethod({ label, icon, color }); setShowAddModal(false); }} />
      )}
    </div>
  );
}

// ── 單個t.record_payment_method按鈕 ──
function PaymentButton2({
  icon, label, active, manageMode, onClick, onDelete, noActiveStyle,
}: {
  icon: string; label: string; active: boolean; manageMode: boolean;
  onClick: () => void; onDelete: (() => void) | null;
  noActiveStyle?: boolean; // 不顯示 active 樣式（用於「更多」面板）
}) {
  return (
    <div className="relative">
      <button onClick={onClick} disabled={manageMode && !onDelete}
        className={`w-full flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl border-2 transition-all select-none ${
          active && !noActiveStyle
            ? "border-accent bg-accent/15 text-accent shadow-sm scale-[1.02]"
            : "border-border bg-card text-foreground hover:border-accent/40"
        } ${manageMode && onDelete ? "opacity-70" : ""}`}>
        <span className="text-base leading-none">{icon}</span>
        <span className={`text-[10px] font-medium leading-none ${active && !noActiveStyle ? "text-accent" : "text-muted-foreground"}`}>{label}</span>
      </button>
      {manageMode && onDelete && (
        <button onClick={onDelete}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm hover:bg-rose-600 transition z-10">
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ── 新增支付方式 Modal ──
function AddPaymentModal({ onClose, onAdd }: { onClose: () => void; onAdd: (label: string, icon: string, color: string) => void; }) {
  const t = useT();
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState(PAYMENT_ICONS[0]);
  const [color, setColor] = useState(PAYMENT_COLORS[0]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fadeIn_0.15s_ease-out]" onClick={onClose}>
      <Card className="w-full max-w-xs p-5 space-y-4 animate-[scaleIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">{t.record_payment_add_title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-4 rounded-xl border-2" style={{ borderColor: color, backgroundColor: color + "15" }}>
            <span className="text-base">{icon}</span>
            <span className="text-[10px] font-medium" style={{ color }}>{label || t.record_payment_name_label}</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{t.record_payment_name_label}</p>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t.record_payment_name_placeholder} maxLength={12} className="bg-background" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{t.record_payment_icon_label}</p>
          <div className="grid grid-cols-6 gap-1.5">
            {PAYMENT_ICONS.map((ic) => (
              <button key={ic} onClick={() => setIcon(ic)}
                className={`aspect-square rounded-lg flex items-center justify-center text-lg transition ${icon === ic ? "bg-primary/15 ring-2 ring-primary" : "bg-muted hover:bg-muted/70"}`}>{ic}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">{t.record_payment_color_label}</p>
          <div className="flex gap-2">
            {PAYMENT_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition ${color === c ? "ring-2 ring-offset-2 ring-foreground" : ""}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <Button onClick={() => { if (!label.trim()) { alert(t.record_payment_name_required); return; } onAdd(label.trim(), icon, color); }} className="w-full h-10">{t.record_payment_add_button}</Button>
      </Card>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ProductButton — 簡潔版
// 點擊 = 記 1 筆 | 長按 = 進入調數模式
// 上滑 = +1 | 下滑 = −1 | 右滑 80px+ = 取消
// ─────────────────────────────────────────────────────────────
interface ProductButtonProps {
  product: Product;
  currency: CurrencyCode;
  payment: PaymentMethod;
  currentMarketId: string | null;
  confirming: boolean;
  onConfirm: (id: string) => void;
  onRecord: (txId: string, productName: string, amount: number, qty: number) => void;
  onUndo: () => void;
  generateOrderId: () => string;
}

function ProductButton({
  product, currency, payment, currentMarketId,
  confirming, onConfirm, onRecord, generateOrderId,
}: ProductButtonProps) {
  const t = useT();
  const addTransaction = useAppStore((s) => s.addTransaction);
  const elRef = useRef<HTMLButtonElement | null>(null);

  // ── 唯一狀態來源：ref（不用 useState 避免渲染時序問題）──
  const stateRef = useRef({
    mode: "idle" as "idle" | "gesture" | "cancelled" | "qtyInput",
    qty: 1,
    startX: 0,
    startY: 0,
    lastY: 0,
    lastX: 0,
    accumY: 0,
    accumX: 0,
    timer: null as ReturnType<typeof setTimeout> | null,
    captured: false,
  });
  // 數量輸入框的值（獨立 state，因為需要即時渲染）
  const [qtyInputValue, setQtyInputValue] = useState("");

  // ── 只用一個 useState 觸發渲染 ──
  const [, forceUpdate] = useState(0);
  const rerender = () => forceUpdate((n) => n + 1);

  useEffect(() => {
    return () => { if (stateRef.current.timer) clearTimeout(stateRef.current.timer); };
  }, []);

  const doRecord = (qty: number) => {
    const totalAmount = product.price * qty;
    const orderId = generateOrderId();
    const txId = addTransaction({
      type: "income", amount: totalAmount, currency: currency,
      category: "sales", paymentMethod: payment, productId: product.id,
      note: qty > 1 ? `${product.name} x${qty}` : product.name,
      marketId: currentMarketId || undefined,
      orderId,
    });
    // 每次記錄都震動（單筆用 success，多筆用 tap）
    haptic(qty > 1 ? "tap" : "success");
    onConfirm(product.id);
    onRecord(txId, qty > 1 ? `${product.name} x${qty}` : product.name, totalAmount, qty);
  };

  const reset = () => {
    const s = stateRef.current;
    s.mode = "idle"; s.qty = 1; s.accumY = 0; s.accumX = 0;
    s.captured = false; s.startX = 0; s.startY = 0; s.lastY = 0; s.lastX = 0;
    if (s.timer) { clearTimeout(s.timer); s.timer = null; }
    rerender();
  };

  // ── pointerdown ──
  const onDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = stateRef.current;
    s.startX = e.clientX; s.startY = e.clientY;
    s.lastX = e.clientX; s.lastY = e.clientY;
    s.accumY = 0; s.accumX = 0; s.qty = 1; s.mode = "idle"; s.captured = false;
    s.timer = setTimeout(() => {
      // 進入手勢模式
      s.mode = "gesture";
      // 此時才捕獲指標（之前不捕獲，讓頁面可以捲動）
      if (elRef.current) { try { elRef.current.setPointerCapture(e.pointerId); } catch {} s.captured = true; }
      haptic("tap");
      rerender();
    }, 400);
  };

  // ── pointermove ──
  const onMove = (e: React.PointerEvent) => {
    const s = stateRef.current;

    if (s.mode === "gesture") {
      // 手勢模式中：處理滑動
      const dy = e.clientY - s.lastY;
      const dx = e.clientX - s.lastX;
      s.lastY = e.clientY; s.lastX = e.clientX;
      s.accumY += dy; s.accumX += dx;

      // 向右取消（80px + 水平為主）
      if (s.accumX >= 80 && Math.abs(s.accumX) > Math.abs(s.accumY) * 1.5) {
        s.mode = "cancelled";
        haptic("warning");
        rerender();
        setTimeout(() => reset(), 600);
        return;
      }

      // 向上 +1
      while (s.accumY <= -25) {
        s.qty++; s.accumY += 25;
        haptic("tick");
        rerender();
      }
      // 向下 −1
      while (s.accumY >= 25) {
        if (s.qty > 1) { s.qty--; haptic("tick"); rerender(); }
        s.accumY -= 25;
      }
    } else if (s.timer || s.mode === "idle") {
      // idle 模式：手指移動了 → 判斷要進入哪種模式
      const dy = e.clientY - s.startY;
      const dx = e.clientX - s.startX;

      // 向左滑超過 40px 且水平為主 → 進入數量輸入模式（優先檢查）
      if (dx < -40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (s.timer) { clearTimeout(s.timer); s.timer = null; }
        // 捕獲指標，避免後續 pointermove 干擾
        if (elRef.current) { try { elRef.current.setPointerCapture(e.pointerId); } catch {} s.captured = true; }
        s.mode = "qtyInput";
        setQtyInputValue("");
        haptic("tap");
        rerender();
        return;
      }

      // 垂直移動超過 12px 且垂直為主 → 立即進入手勢模式（不用等 400ms）
      if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        // 取消長按計時器
        if (s.timer) { clearTimeout(s.timer); s.timer = null; }
        // 進入手勢模式
        s.mode = "gesture";
        // 捕獲指標
        if (elRef.current) { try { elRef.current.setPointerCapture(e.pointerId); } catch {} s.captured = true; }
        // 重置基準點為當前位置，讓後續移動從這裡開始累積
        s.lastY = e.clientY; s.lastX = e.clientX;
        s.accumY = 0; s.accumX = 0;
        haptic("tap");
        rerender();
        return;
      }

      // 水平移動超過 10px（向右）→ 取消長按（讓瀏覽器捲動或使用者取消）
      if (dx > 10 && Math.abs(dx) > Math.abs(dy)) {
        if (s.timer) { clearTimeout(s.timer); s.timer = null; }
      }
    }
  };

  // ── pointerup ──
  const onUp = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (s.timer) { clearTimeout(s.timer); s.timer = null; }
    if (s.captured && elRef.current) { try { elRef.current.releasePointerCapture(e.pointerId); } catch {} s.captured = false; }

    if (s.mode === "gesture") {
      // 手勢模式結束 → 記錄
      doRecord(s.qty);
      reset();
    } else if (s.mode === "cancelled") {
      reset();
    }
  };

  // ── click（只在 idle 時記錄 1 筆）──
  const onClick = (e: React.MouseEvent) => {
    const s = stateRef.current;
    if (s.mode !== "idle") { e.preventDefault(); return; }
    if (s.timer) { clearTimeout(s.timer); s.timer = null; }
    doRecord(1);
  };

  const s = stateRef.current;

  return (
    <button
      ref={elRef}
      onClick={onClick}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ touchAction: "none", backgroundColor: (s.mode === "idle" && !confirming && product.color) ? product.color : undefined }}
      className={`relative bg-card border-2 rounded-xl p-2.5 text-center transition-all overflow-hidden min-h-[68px] flex flex-col justify-center select-none ${
        s.mode === "cancelled" ? "border-rose-500 bg-rose-50"
        : s.mode === "gesture" ? "border-primary bg-primary/5 scale-[1.03] shadow-lg"
        : confirming ? "border-emerald-500 bg-emerald-50 scale-[0.97]"
        : "border-primary/20 hover:border-primary active:scale-[0.95] cursor-pointer"
      }`}
    >
      {confirming && s.mode === "idle" && (
        <div className="absolute inset-0 bg-emerald-50/95 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        </div>
      )}
      {s.mode === "cancelled" && (
        <div className="absolute inset-0 bg-rose-50/95 flex flex-col items-center justify-center">
          <X className="w-6 h-6 text-rose-500" strokeWidth={3} />
          <p className="text-[10px] font-semibold text-rose-600 mt-1">{t.record_cancelled}</p>
        </div>
      )}
      {s.mode === "qtyInput" && (
        <div className="absolute inset-0 bg-accent/10 flex flex-col items-center justify-center px-1 z-20">
          <p className="text-[9px] text-accent font-semibold mb-0.5">{t.record_qty}</p>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={qtyInputValue}
            onChange={(e) => {
              // 只允許數字
              const v = e.target.value.replace(/[^0-9]/g, "");
              setQtyInputValue(v);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const qty = parseInt(qtyInputValue) || 0;
                if (qty > 0) {
                  doRecord(qty);
                  reset();
                }
              } else if (e.key === "Escape") {
                reset();
              }
            }}
            onBlur={() => {
              // 失焦時如果有值就記錄，否則取消
              const qty = parseInt(qtyInputValue) || 0;
              if (qty > 0) {
                doRecord(qty);
                reset();
              } else {
                reset();
              }
            }}
            autoFocus
            placeholder="1"
            className="w-full text-center text-lg font-bold tabular-nums text-primary bg-background/80 rounded-md py-1 outline-none border border-accent/40"
          />
          {qtyInputValue && parseInt(qtyInputValue) > 0 && (
            <p className="text-[9px] text-muted-foreground mt-0.5 tabular-nums">
              = {formatCurrency(product.price * (parseInt(qtyInputValue) || 0), currency)}
            </p>
          )}
          <p className="text-[8px] text-muted-foreground/60 mt-0.5">Enter 確認 · Esc 取消</p>
        </div>
      )}
      {s.mode === "gesture" && (
        <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center px-1">
          <div className="text-2xl font-bold tabular-nums text-primary">×{s.qty}</div>
          <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
            {formatCurrency(product.price * s.qty, currency)}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-between py-1 pointer-events-none">
            <div className="text-[10px] font-medium text-muted-foreground/60">↑ +1</div>
            <div className="text-[9px] text-muted-foreground/50 text-center">↑+1 ↓−1<br/>→取消</div>
            <div className="text-[10px] font-medium text-muted-foreground/60">↓ −1</div>
          </div>
        </div>
      )}
      {s.mode === "idle" && !confirming && (
        <>
          <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{product.name}</p>
          <p className="text-sm font-bold text-primary tabular-nums mt-1 leading-none">
            {formatCurrency(product.price, currency)}
          </p>
        </>
      )}
    </button>
  );
}

function ProductsView() {
  const t = useT();
  const { products, currency, addProduct, updateProduct, deleteProduct } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  // 按鈕顏色（可選，用於視覺分組）
  const [color, setColor] = useState<string>("");
  // 是否展開自訂色板
  const [showColorPalette, setShowColorPalette] = useState(false);
  // 顯示模式：grid（格子）或 list（列表）
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // 多選刪除模式
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // 長按觸發的單個商品（用於動畫過渡）
  const [longPressTarget, setLongPressTarget] = useState<string | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 用 ref 追蹤多選模式狀態，避免 onClick 時 state 還沒更新
  const multiSelectModeRef = useRef(false);
  const longPressTargetRef = useRef<string | null>(null);

  useEffect(() => {
    multiSelectModeRef.current = multiSelectMode;
  }, [multiSelectMode]);

  useEffect(() => {
    longPressTargetRef.current = longPressTarget;
  }, [longPressTarget]);

  // 清理 timer
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const handleAdd = () => {
    const p = parseFloat(price);
    if (!name.trim()) return alert(t.products_name_required);
    if (!p || p <= 0) return alert(t.products_price_required);
    if (editingProductId) {
      // 編輯模式
      updateProduct(editingProductId, { name: name.trim(), price: p, unit: unit.trim() || t.products_unit_default, color: color || undefined });
      setEditingProductId(null);
    } else {
      // 新增模式
      addProduct({ name: name.trim(), price: p, unit: unit.trim() || t.products_unit_default, categoryId: "sales", color: color || undefined });
    }
    setName(""); setPrice(""); setUnit(t.products_unit_default); setColor(""); setShowColorPalette(false); setShowForm(false);
  };

  // 編輯商品 — 載入商品資料到表單
  const handleEditProduct = (product: { id: string; name: string; price: number; unit: string; color?: string }) => {
    setEditingProductId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setUnit(product.unit);
    setColor(product.color || "");
    setShowColorPalette(false);
    setShowForm(true);
  };

  // 取消編輯/新增
  const handleCancelForm = () => {
    setEditingProductId(null);
    setName(""); setPrice(""); setUnit(t.products_unit_default); setColor(""); setShowColorPalette(false); setShowForm(false);
  };

  // 長按商品 → 進入多選模式 + 選中該商品
  const handleProductLongPress = (productId: string) => {
    longPressTimerRef.current = setTimeout(() => {
      // 立即更新 ref，避免 onClick 時 state 還沒更新
      multiSelectModeRef.current = true;
      longPressTargetRef.current = productId;
      setMultiSelectMode(true);
      setLongPressTarget(productId);
      setSelectedIds(new Set([productId]));
      // 0.6 秒後清除 longPressTarget（動畫過渡完成），但保留多選模式
      setTimeout(() => {
        setLongPressTarget(null);
        longPressTargetRef.current = null;
      }, 600);
    }, 500);
  };

  const handleProductPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // 點擊商品：
  // - 非多選模式 → 不做事
  // - 多選模式 → 切換選中狀態
  // - 但若剛結束長按（longPressTarget 還在），忽略這次 click 避免取消選中
  const handleProductClick = (productId: string) => {
    // 用 ref 取最新狀態
    if (!multiSelectModeRef.current) return;
    if (longPressTargetRef.current) return; // 長按剛結束，忽略
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // 取消多選模式
  const handleCancelMultiSelect = () => {
    multiSelectModeRef.current = false;
    setMultiSelectMode(false);
    setSelectedIds(new Set());
  };

  // 確認刪除所有選中商品
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(t.products_delete_confirm.replace("{n}", String(selectedIds.size)))) return;
    selectedIds.forEach((id) => deleteProduct(id));
    multiSelectModeRef.current = false;
    setMultiSelectMode(false);
    setSelectedIds(new Set());
  };

  return (
    <div
      className="px-5 space-y-4"
      onClick={(e) => {
        // 點擊空白處（非商品、非工具列、非按鈕）取消多選模式
        if (multiSelectModeRef.current) {
          const target = e.target as HTMLElement;
          // 排除：商品卡片、工具列、按鈕、輸入框
          if (
            !target.closest("[data-product-id]") &&
            !target.closest(".bg-rose-50") &&  // 工具列
            !target.closest("button") &&
            !target.closest("input") &&
            !target.closest("textarea")
          ) {
            handleCancelMultiSelect();
          }
        }
      }}
    >
      {/* 多選模式工具列 */}
      {multiSelectMode && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between animate-[fadeIn_0.2s_ease-out]">
          <div>
            <p className="text-sm font-semibold text-rose-700">
              {t.products_selected_count.replace("{n}", String(selectedIds.size))}
            </p>
            <p className="text-xs text-rose-600 mt-0.5">
              {t.products_select_hint}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t.products_delete_selected.replace("{n}", String(selectedIds.size))}
            </button>
            <button
              onClick={handleCancelMultiSelect}
              className="px-3 py-1.5 bg-white border border-rose-300 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-50 transition"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}

      {/* 操作提示（僅非多選模式顯示） */}
      {!multiSelectMode && products.length > 0 && (
        <div className="bg-muted/60 rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="text-sm">💡</span>
          <span>{t.products_long_press_hint}</span>
        </div>
      )}

      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full h-12 border-dashed border-primary text-primary hover:bg-primary/5"
        >
          <Plus className="w-4 h-4 mr-1.5" /> {t.products_add_product}
        </Button>
      ) : (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{editingProductId ? t.products_edit_product : t.products_add_product}</h3>
            <button onClick={handleCancelForm} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <Input placeholder={t.products_name} value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
            <div className="flex gap-2">
              <Input placeholder={t.products_price_placeholder} value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className="bg-background flex-1" />
              <Input placeholder={t.products_unit_placeholder} value={unit} onChange={(e) => setUnit(e.target.value)} className="bg-background w-24" />
            </div>
            {/* 按鈕顏色（可選，用於視覺分組） */}
            <div>
              <p className="text-[11px] text-muted-foreground mb-1.5">{t.products_color_label}</p>
              <div className="flex gap-1.5 flex-wrap items-center">
                <button
                  onClick={() => setColor("")}
                  className={`w-7 h-7 rounded-full border-2 transition ${color === "" ? "border-foreground ring-2 ring-offset-1 ring-foreground/30" : "border-border"}`}
                  style={{ background: "#FFFFFF" }}
                  aria-label="無顏色"
                />
                {PRODUCT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition ${color === c ? "border-foreground ring-2 ring-offset-1 ring-foreground/30" : "border-border"}`}
                    style={{ background: c }}
                    aria-label={`顏色 ${c}`}
                  />
                ))}
                {/* 更多顏色 — 點擊展開色板（不用 HSV slider，避免手機原生 picker 難用） */}
                <button
                  onClick={() => setShowColorPalette(!showColorPalette)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition ${
                    showColorPalette || (color && !PRODUCT_COLORS.includes(color))
                      ? "border-foreground ring-2 ring-offset-1 ring-foreground/30"
                      : "border-border"
                  }`}
                  style={{ background: "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" }}
                  aria-label="更多顏色"
                >
                  <Plus className="w-3 h-3 text-white drop-shadow" strokeWidth={3} />
                </button>
              </div>

              {/* 展開的色板 — 8 系飽和色 + 灰階，直接點選 */}
              {showColorPalette && (
                <div className="mt-2 p-2.5 bg-muted/40 rounded-lg animate-[fadeIn_0.15s_ease-out]">
                  <p className="text-[10px] text-muted-foreground mb-1.5">{t.products_color_label || ""}</p>
                  <div className="grid grid-cols-6 gap-1.5 mb-2">
                    {EXTENDED_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`aspect-square rounded-md border transition hover:scale-110 ${color === c ? "border-foreground scale-110 ring-1 ring-foreground/40" : "border-white/40"}`}
                        style={{ background: c }}
                        aria-label={`顏色 ${c}`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-1.5">{t.record_grayscale}</p>
                  <div className="grid grid-cols-6 gap-1">
                    {GRAYSCALE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`aspect-square rounded-md border transition hover:scale-110 ${color === c ? "border-foreground scale-110 ring-1 ring-foreground/40" : "border-white/40"}`}
                        style={{ background: c }}
                        aria-label={`灰階 ${c}`}
                      />
                    ))}
                  </div>
                  {/* 已選顏色預覽 */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground">{t.record_selected}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded border border-border" style={{ background: color || "#FFFFFF" }} />
                      <span className="text-[10px] font-mono text-foreground">{color || "-"}</span>
                    </div>
                  </div>
                </div>
              )}
              {color && !PRODUCT_COLORS.includes(color) && !showColorPalette && (
                <p className="text-[10px] text-muted-foreground mt-1">自訂顏色：{color}</p>
              )}
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full">{editingProductId ? t.products_save_edit : t.products_save}</Button>
        </Card>
      )}

      {products.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-3xl mb-2">📦</p>
          <p className="text-sm font-medium text-foreground">{t.record_no_products}</p>
          <p className="text-xs text-muted-foreground mt-1">{t.record_create_products}</p>
        </Card>
      ) : (
        <>
          {/* 顯示模式切換 + 商品數量 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              {t.products_count.replace("{n}", String(products.length))}
            </span>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "grid" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"
                }`}
                aria-label={t.products_view_grid}
                title={t.products_view_grid}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "list" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"
                }`}
                aria-label={t.products_view_list}
                title={t.products_view_list}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 格子模式 — 一屏可見多個商品 */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-3 gap-2">
              {products.map((p) => {
                const isSelected = selectedIds.has(p.id);
                const isLongPressing = longPressTarget === p.id;
                return (
                  <div
                    key={p.id}
                    data-product-id={p.id}
                    onMouseDown={() => handleProductLongPress(p.id)}
                    onMouseUp={handleProductPressEnd}
                    onMouseLeave={handleProductPressEnd}
                    onTouchStart={() => handleProductLongPress(p.id)}
                    onTouchEnd={handleProductPressEnd}
                    onClick={() => handleProductClick(p.id)}
                    style={{ backgroundColor: (!isSelected && !isLongPressing && p.color) ? p.color : undefined }}
                    className={`relative bg-card border-2 rounded-xl p-2.5 cursor-pointer transition-all select-none ${
                      isSelected || isLongPressing
                        ? "border-rose-500 bg-rose-50 shake-once"
                        : "border-border hover:border-primary/40"
                    } ${multiSelectMode && isSelected ? "ring-2 ring-rose-300" : ""}`}
                  >
                    {/* 選中標記 */}
                    {(isSelected || isLongPressing) && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center z-10 animate-[fadeIn_0.2s_ease-out]">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    {/* 編輯按鈕 — 非多選模式時顯示 */}
                    {!multiSelectMode && !isSelected && !isLongPressing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(p);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center z-10 hover:bg-accent/30 transition"
                        aria-label={t.products_edit_product}
                      >
                        <Pencil className="w-2.5 h-2.5 text-accent" />
                      </button>
                    )}
                    <p className={`text-xs font-medium leading-tight line-clamp-2 min-h-[28px] ${
                      isSelected || isLongPressing ? "text-rose-700" : "text-foreground"
                    }`}>
                      {p.name}
                    </p>
                    <p className={`text-sm font-bold tabular-nums mt-1 ${
                      isSelected || isLongPressing ? "text-rose-600" : "text-primary"
                    }`}>
                      {formatCurrency(p.price, currency)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">/ {p.unit}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 列表模式 — 詳細資訊 */
            <div className="space-y-2">
              {products.map((p) => {
                const isSelected = selectedIds.has(p.id);
                const isLongPressing = longPressTarget === p.id;
                return (
                  <div
                    key={p.id}
                    data-product-id={p.id}
                    onMouseDown={() => handleProductLongPress(p.id)}
                    onMouseUp={handleProductPressEnd}
                    onMouseLeave={handleProductPressEnd}
                    onTouchStart={() => handleProductLongPress(p.id)}
                    onTouchEnd={handleProductPressEnd}
                    onClick={() => handleProductClick(p.id)}
                    className={`bg-card border-2 rounded-xl p-3.5 flex items-center justify-between cursor-pointer transition-all select-none ${
                      isSelected || isLongPressing
                        ? "border-rose-500 bg-rose-50 shake-once"
                        : "border-border hover:border-primary/40"
                    } ${multiSelectMode && isSelected ? "ring-2 ring-rose-300" : ""}`}
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-3">
                      {/* 選中標記 */}
                      {(isSelected || isLongPressing) && (
                        <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 animate-[fadeIn_0.2s_ease-out]">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          isSelected || isLongPressing ? "text-rose-700" : "text-foreground"
                        }`}>
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatCurrency(p.price, currency)} / {p.unit}
                        </p>
                      </div>
                    </div>
                    {/* 編輯按鈕 — 點擊進入編輯模式 */}
                    {!multiSelectMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(p);
                        }}
                        className="flex items-center gap-1 text-[11px] text-accent hover:text-foreground px-2 py-1.5 rounded-md hover:bg-accent/10 transition flex-shrink-0"
                        aria-label={t.products_edit_product}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {t.products_edit}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 動畫樣式 */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :global(.shake-once) {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
