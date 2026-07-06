"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore, CATEGORIES, PAYMENT_METHODS, PAYMENT_CATEGORIES, CURRENCIES, formatCurrency, getPaymentMethodInfo } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Store, X, ChevronDown, Undo2, Check, RotateCcw, SlidersHorizontal, LayoutGrid, List, Trash2 } from "lucide-react";
import type { TransactionType, CategoryId, PaymentMethod, Product } from "@/lib/store";

export function RecordPage() {
  const [mode, setMode] = useState<"record" | "products">("record");
  return (
    <div className="pb-4 flex flex-col h-full">
      <h1 className="text-xl font-bold pt-4 px-4 text-foreground">記帳</h1>

      {/* Mode toggle — segmented control */}
      <div className="mx-4 mt-2 flex bg-muted rounded-lg p-0.5">
        <button onClick={() => setMode("record")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${mode === "record" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
          記帳
        </button>
        <button onClick={() => setMode("products")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${mode === "products" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
          商品
        </button>
      </div>

      <div className="flex-1 mt-3">
        {mode === "record" ? <RecordView /> : <ProductsView />}
      </div>
    </div>
  );
}

// ── 主要支付方式（前 5 個，置頂大按鈕，不滑動）──
const TOP_PAYMENTS: PaymentMethod[] = ["cash", "payme", "fps", "alipayhk", "wechat_pay"];

// ── Toast 通知型別 ──
interface ToastState {
  id: string;
  txId: string;
  productName: string;
  amount: number;
  currency: string;
  timestamp: number;
}

function RecordView() {
  const { currency, products, currentMarketId, markets, addTransaction, setCurrentMarket, deleteTransaction, customPaymentMethods } = useAppStore();
  const [payment, setPayment] = useState<PaymentMethod>("cash");

  // 取得支付方式標籤（支援自訂）
  const getPaymentMethodLabel = (m: PaymentMethod): string => {
    return getPaymentMethodInfo(m, customPaymentMethods).label;
  };
  const [showAdvanced, setShowAdvanced] = useState(false);
  // 手動記帳欄位
  const [txType, setTxType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId | "">("");
  const [note, setNote] = useState("");
  const [showMarketPicker, setShowMarketPicker] = useState(false);

  // ── 點擊回饋相關 state ──
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lastTx, setLastTx] = useState<{ txId: string; productName: string; amount: number } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentMarket = markets.find((m) => m.id === currentMarketId);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleQuickProduct = (p: { id: string; name: string; price: number }) => {
    const txId = addTransaction({
      type: "income",
      amount: p.price,
      currency,
      category: "sales",
      paymentMethod: payment,
      productId: p.id,
      note: p.name,
      marketId: currentMarketId || undefined,
    });

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
    if (!amt || amt <= 0) return alert("請輸入金額");
    if (!category) return alert("請選擇分類");
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
    setCategory("");
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
              <p className="text-[10px] text-muted-foreground leading-tight">已記錄銷售 · {getPaymentMethodLabel(payment)}</p>
              <p className="text-xs font-semibold text-foreground truncate leading-tight mt-0.5">
                {toast.productName} · {formatCurrency(toast.amount, currency)}
              </p>
            </div>
            <button
              onClick={handleUndo}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 px-2 py-1.5 rounded-lg hover:bg-primary/8 transition flex-shrink-0"
            >
              <Undo2 className="w-3.5 h-3.5" />
              撤銷
            </button>
            <button
              onClick={handleDismissToast}
              className="text-muted-foreground hover:text-foreground p-1 flex-shrink-0"
              aria-label="關閉通知"
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
              <p className="text-xs text-muted-foreground font-medium">⚡ 點商品即記錄銷售</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/70">長按調數量 · →取消</span>
                {lastTx && (
                  <button
                    onClick={handleUndo}
                    className="text-[10px] text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    撤銷上筆
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
                  onRecord={(txId, productName, amount) => {
                    setToast({
                      id: `toast_${Date.now()}`,
                      txId,
                      productName,
                      amount,
                      currency,
                      timestamp: Date.now(),
                    });
                    setLastTx({ txId, productName, amount });
                    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
                  }}
                  onUndo={handleUndo}
                />
              ))}
            </div>
            {lastTx && (
              <div className="mt-2 bg-muted/60 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                  <RotateCcw className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    最近：{lastTx.productName} · {formatCurrency(lastTx.amount, currency)}
                  </span>
                </div>
                <button
                  onClick={handleUndo}
                  className="text-primary hover:text-primary/80 font-medium flex-shrink-0"
                >
                  撤銷
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 bg-muted/50 rounded-xl p-6 text-center border border-dashed border-border">
            <p className="text-2xl mb-1">📦</p>
            <p className="text-sm font-medium text-foreground">尚無商品</p>
            <p className="text-xs text-muted-foreground mt-1">切換到「商品管理」建立商品目錄</p>
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
              手動記帳（自訂金額 / 支出 / 分類）
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition ${showAdvanced ? "rotate-180" : ""}`} />
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-4 p-4 bg-card border border-border rounded-xl">
              {/* 收入/支出切換 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setTxType("expense"); setCategory(""); }}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                    txType === "expense" ? "bg-rose-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  💸 支出
                </button>
                <button
                  onClick={() => { setTxType("income"); setCategory(""); }}
                  className={`py-2.5 rounded-lg text-sm font-semibold transition ${
                    txType === "income" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  💰 收入
                </button>
              </div>

              {/* 金額 */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">金額</p>
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
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">分類</p>
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
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 市集 */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">市集</p>
                <button
                  onClick={() => setShowMarketPicker(!showMarketPicker)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    {currentMarket ? currentMarket.name : "🌐 不指定市集"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                {showMarketPicker && (
                  <Card className="mt-2 p-2 max-h-48 overflow-y-auto">
                    <button
                      onClick={() => { setCurrentMarket(null); setShowMarketPicker(false); }}
                      className="w-full text-left p-2 hover:bg-muted rounded-lg text-sm"
                    >
                      🌐 不指定市集
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
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">備註（選填）</p>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="例如：客人買兩份、補貨..."
                  className="bg-background resize-none min-h-[50px] text-sm"
                  maxLength={100}
                />
              </div>

              <Button onClick={handleSubmit} className="w-full h-11 font-semibold">
                ✓ 完成記帳
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
  const { customPaymentMethods, addCustomPaymentMethod, deleteCustomPaymentMethod, visiblePayments, togglePaymentVisibility, reorderVisiblePayments } = useAppStore();
  const [showMore, setShowMore] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageMode, setShowManageMode] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState(false);
  const sortTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getPaymentInfo = (m: PaymentMethod): { label: string; icon: string } => {
    if (m.startsWith("custom_")) {
      const custom = customPaymentMethods.find((c) => `custom_${c.id}` === m);
      if (custom) return { label: custom.label, icon: custom.icon };
    }
    const info = PAYMENT_METHODS[m as keyof typeof PAYMENT_METHODS];
    return { label: info?.label || m, icon: info?.icon || "💳" };
  };

  const shortLabel = (label: string) => {
    return label.replace("Touch 'n ", "TnG").replace("WeChat Pay", "WeChat").replace("Credit Card", "信用卡").replace("Bank Transfer", "轉帳");
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
      if (typeof navigator !== "undefined" && "vibrate" in navigator) (navigator as any).vibrate?.(30);
    }, 500);
  };
  const handleSortPressEnd = () => {
    if (sortTimerRef.current) { clearTimeout(sortTimerRef.current); sortTimerRef.current = null; }
  };

  // 點擊空白處退出排序
  const handleSortAreaClick = (e: React.MouseEvent) => {
    if (sortMode) {
      // 如果點到的不是支付方式按鈕本身，退出排序
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
        <p className="text-xs text-muted-foreground font-medium">支付方式</p>
        {!sortMode && <p className="text-[10px] text-muted-foreground/50">長按排序</p>}
        {sortMode && <p className="text-[10px] text-accent/70">拖拽排序中</p>}
      </div>

      {/* 主頁支付方式 */}
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
                onDelete={() => { if (confirm(`刪除支付方式「${c.label}」？`)) { deleteCustomPaymentMethod(c.id); if (payment === m) setPayment("cash"); } }} />
              {showMore && !sortMode && (
                <button onClick={(e) => { e.stopPropagation(); togglePaymentVisibility(`custom_${c.id}`); }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm z-10 animate-[fadeIn_0.15s_ease-out] text-[13px] leading-none font-bold pb-0.5">
                  −
                </button>
              )}
            </div>
          );
        })}
        {/* 更多按鈕 */}
        <button onClick={() => setShowMore(!showMore)}
          className={`flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl border-2 transition ${showMore ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/40"}`}>
          <span className="text-base leading-none">🌐</span>
          <span className="text-[10px] font-medium">更多</span>
        </button>
      </div>

      {/* 更多展開 — 只顯示還沒在主頁的支付方式，帶 + 按鈕 */}
      {showMore && (
        <div className="mt-2 animate-[fadeIn_0.2s_ease-out]">
          {(() => {
            // 收集所有未顯示的支付方式
            const hidden: { m: string; info: { label: string; icon: string } }[] = [];
            PAYMENT_CATEGORIES.forEach((cat) => {
              cat.payments.forEach((m) => {
                if (!visiblePayments.includes(m)) {
                  const info = PAYMENT_METHODS[m as keyof typeof PAYMENT_METHODS];
                  hidden.push({ m, info: { label: info?.label || m, icon: info?.icon || "💳" } });
                }
              });
            });
            customPaymentMethods.forEach((c) => {
              const m = `custom_${c.id}`;
              if (!visiblePayments.includes(m)) {
                hidden.push({ m, info: { label: c.label, icon: c.icon } });
              }
            });

            if (hidden.length === 0) {
              return (
                <div className="text-center py-3 text-[11px] text-muted-foreground">
                  所有支付方式已顯示
                </div>
              );
            }

            return (
              <div className="grid grid-cols-5 gap-1.5">
                {hidden.map(({ m, info }) => {
                  const active = payment === (m as PaymentMethod);
                  return (
                    <div key={m} className="relative">
                      <PaymentButton2 icon={info.icon} label={shortLabel(info.label)} active={active}
                        manageMode={false} onClick={() => { setPayment(m as PaymentMethod); setShowMore(false); }} onDelete={null} />
                      <button onClick={(e) => { e.stopPropagation(); togglePaymentVisibility(m); }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm z-10 animate-[fadeIn_0.15s_ease-out] text-[13px] leading-none font-bold pb-0.5">
                        +
                      </button>
                    </div>
                  );
                })}
                {/* 新增自訂支付 */}
                <div className="relative">
                  <button onClick={() => setShowAddModal(true)}
                    className="w-full flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 text-accent hover:bg-accent/10 transition">
                    <Plus className="w-4 h-4" />
                    <span className="text-[10px] font-medium">新增</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 新增支付方式 Modal */}
      {showAddModal && (
        <AddPaymentModal onClose={() => setShowAddModal(false)}
          onAdd={(label, icon, color) => { addCustomPaymentMethod({ label, icon, color }); setShowAddModal(false); }} />
      )}
    </div>
  );
}

// ── 單個支付方式按鈕 ──
function PaymentButton2({
  icon, label, active, manageMode, onClick, onDelete,
}: {
  icon: string; label: string; active: boolean; manageMode: boolean;
  onClick: () => void; onDelete: (() => void) | null;
}) {
  return (
    <div className="relative">
      <button onClick={onClick} disabled={manageMode && !onDelete}
        className={`w-full flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl border-2 transition-all ${active ? "border-primary bg-primary text-primary-foreground shadow-sm scale-[1.02]" : "border-border bg-card text-foreground hover:border-primary/40"} ${manageMode && onDelete ? "opacity-70" : ""}`}>
        <span className="text-base leading-none">{icon}</span>
        <span className={`text-[10px] font-medium leading-none ${active ? "" : "text-muted-foreground"}`}>{label}</span>
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
  const [label, setLabel] = useState("");
  const [icon, setIcon] = useState(PAYMENT_ICONS[0]);
  const [color, setColor] = useState(PAYMENT_COLORS[0]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fadeIn_0.15s_ease-out]" onClick={onClose}>
      <Card className="w-full max-w-xs p-5 space-y-4 animate-[scaleIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">新增支付方式</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-col items-center justify-center gap-0.5 py-2.5 px-4 rounded-xl border-2" style={{ borderColor: color, backgroundColor: color + "15" }}>
            <span className="text-base">{icon}</span>
            <span className="text-[10px] font-medium" style={{ color }}>{label || "名稱"}</span>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">名稱</p>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="例如：八達通、PayPal" maxLength={12} className="bg-background" />
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">圖示</p>
          <div className="grid grid-cols-8 gap-1">
            {PAYMENT_ICONS.map((ic) => (
              <button key={ic} onClick={() => setIcon(ic)}
                className={`aspect-square rounded-lg flex items-center justify-center text-lg transition ${icon === ic ? "bg-primary/15 ring-2 ring-primary" : "bg-muted hover:bg-muted/70"}`}>{ic}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">顏色</p>
          <div className="flex gap-2">
            {PAYMENT_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition ${color === c ? "ring-2 ring-offset-2 ring-foreground" : ""}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <Button onClick={() => { if (!label.trim()) { alert("請輸入名稱"); return; } onAdd(label.trim(), icon, color); }} className="w-full h-10">新增</Button>
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
  currency: string;
  payment: PaymentMethod;
  currentMarketId: string | null;
  confirming: boolean;
  onConfirm: (id: string) => void;
  onRecord: (txId: string, productName: string, amount: number) => void;
  onUndo: () => void;
}

function ProductButton({
  product, currency, payment, currentMarketId,
  confirming, onConfirm, onRecord,
}: ProductButtonProps) {
  const addTransaction = useAppStore((s) => s.addTransaction);
  const elRef = useRef<HTMLButtonElement | null>(null);

  // ── 唯一狀態來源：ref（不用 useState 避免渲染時序問題）──
  const stateRef = useRef({
    mode: "idle" as "idle" | "gesture" | "cancelled",
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

  // ── 只用一個 useState 觸發渲染 ──
  const [, forceUpdate] = useState(0);
  const rerender = () => forceUpdate((n) => n + 1);

  useEffect(() => {
    return () => { if (stateRef.current.timer) clearTimeout(stateRef.current.timer); };
  }, []);

  const doRecord = (qty: number) => {
    const txId = addTransaction({
      type: "income", amount: product.price, currency: currency as any,
      category: "sales", paymentMethod: payment, productId: product.id,
      note: qty > 1 ? `${product.name} x${qty}` : product.name,
      marketId: currentMarketId || undefined,
    });
    onConfirm(product.id);
    onRecord(txId, qty > 1 ? `${product.name} x${qty}` : product.name, product.price * qty);
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
      if (typeof navigator !== "undefined" && "vibrate" in navigator) (navigator as any).vibrate?.(30);
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
        if (typeof navigator !== "undefined" && "vibrate" in navigator) (navigator as any).vibrate?.([30, 30, 30]);
        rerender();
        setTimeout(() => reset(), 600);
        return;
      }

      // 向上 +1
      while (s.accumY <= -25) {
        s.qty++; s.accumY += 25;
        if (typeof navigator !== "undefined" && "vibrate" in navigator) (navigator as any).vibrate?.(15);
        rerender();
      }
      // 向下 −1
      while (s.accumY >= 25) {
        if (s.qty > 1) { s.qty--; if (typeof navigator !== "undefined" && "vibrate" in navigator) (navigator as any).vibrate?.(15); rerender(); }
        s.accumY -= 25;
      }
    } else if (s.timer) {
      // 非手勢模式，手指移動了 → 取消長按（讓瀏覽器捲動）
      const moved = Math.abs(e.clientY - s.startY) > 10 || Math.abs(e.clientX - s.startX) > 10;
      if (moved) { clearTimeout(s.timer); s.timer = null; }
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
      style={{ touchAction: s.mode === "gesture" ? "none" : "pan-y" }}
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
          <p className="text-[10px] font-semibold text-rose-600 mt-1">已取消</p>
        </div>
      )}
      {s.mode === "gesture" && (
        <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center px-1">
          <div className="text-2xl font-bold tabular-nums text-primary">×{s.qty}</div>
          <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
            {formatCurrency(product.price * s.qty, currency as any)}
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
            {formatCurrency(product.price, currency as any)}
          </p>
        </>
      )}
    </button>
  );
}

function ProductsView() {
  const { products, currency, addProduct, deleteProduct } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("個");
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
    if (!name.trim()) return alert("請輸入商品名稱");
    if (!p || p <= 0) return alert("請輸入有效單價");
    addProduct({ name: name.trim(), price: p, unit: unit.trim() || "個", categoryId: "sales" });
    setName(""); setPrice(""); setUnit("個"); setShowForm(false);
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
    if (!confirm(`確定要刪除選中的 ${selectedIds.size} 個商品？`)) return;
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
              已選 {selectedIds.size} 個商品
            </p>
            <p className="text-xs text-rose-600 mt-0.5">
              點擊其他商品加入選擇 · 點擊空白處或取消鍵退出
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              刪除 ({selectedIds.size})
            </button>
            <button
              onClick={handleCancelMultiSelect}
              className="px-3 py-1.5 bg-white border border-rose-300 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-50 transition"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 操作提示（僅非多選模式顯示） */}
      {!multiSelectMode && products.length > 0 && (
        <div className="bg-muted/60 rounded-lg px-3 py-2 text-xs text-muted-foreground flex items-center gap-1.5">
          <span className="text-sm">💡</span>
          <span>長按任一商品進入多選刪除模式 · 可一次選擇多個商品刪除 · 點擊空白處或取消鍵退出</span>
        </div>
      )}

      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="w-full h-12 border-dashed border-primary text-primary hover:bg-primary/5"
        >
          <Plus className="w-4 h-4 mr-1.5" /> 新增商品
        </Button>
      ) : (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">新增商品</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <Input placeholder="商品名稱" value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
            <div className="flex gap-2">
              <Input placeholder="單價" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className="bg-background flex-1" />
              <Input placeholder="單位" value={unit} onChange={(e) => setUnit(e.target.value)} className="bg-background w-24" />
            </div>
          </div>
          <Button onClick={handleAdd} className="w-full">儲存商品</Button>
        </Card>
      )}

      {products.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-3xl mb-2">📦</p>
          <p className="text-sm font-medium text-foreground">尚無商品</p>
          <p className="text-xs text-muted-foreground mt-1">建立商品後即可一鍵記錄銷售</p>
        </Card>
      ) : (
        <>
          {/* 顯示模式切換 + 商品數量 */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              共 {products.length} 個商品
            </span>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "grid" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"
                }`}
                aria-label="格子顯示"
                title="格子顯示"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition ${
                  viewMode === "list" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"
                }`}
                aria-label="列表顯示"
                title="列表顯示"
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
