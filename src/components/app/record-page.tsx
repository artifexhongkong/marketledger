"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore, CATEGORIES, PAYMENT_METHODS, formatCurrency } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Store, X, ChevronDown, Undo2, Check, RotateCcw, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import type { TransactionType, CategoryId, PaymentMethod, Product } from "@/lib/store";

export function RecordPage() {
  const [mode, setMode] = useState<"record" | "products">("record");
  return (
    <div className="pb-4 flex flex-col h-full">
      <h1 className="text-2xl font-semibold tracking-tight pt-2 px-5 text-foreground">記帳</h1>

      {/* Mode toggle */}
      <div className="bg-muted p-1 rounded-xl flex mx-5 mt-3">
        <button
          onClick={() => setMode("record")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            mode === "record" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          ✏️ 快速記帳
        </button>
        <button
          onClick={() => setMode("products")}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
            mode === "products" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          📦 商品管理
        </button>
      </div>

      <div className="flex-1 mt-4">
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
  const { currency, products, currentMarketId, markets, addTransaction, setCurrentMarket, deleteTransaction } = useAppStore();
  const [payment, setPayment] = useState<PaymentMethod>("cash");
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
      {/* Toast 通知 — sticky 在頂部，從上方滑入（不偏左） */}
      {toast && (
        <div className="sticky top-0 z-50 -mx-5 px-3 pt-2 pb-1 bg-background/95 backdrop-blur-sm">
          <div className="bg-card border border-emerald-200 shadow-lg rounded-2xl px-3 py-2.5 flex items-center gap-2.5 toast-slide-down">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground leading-tight">已記錄銷售 · {PAYMENT_METHODS[payment].label}</p>
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

      <div className="px-5 flex-1 overflow-y-auto">
        {/* ── 1. 支付方式：5 大按鈕置頂，一鍵切換，不滑動 ── */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">💳 支付方式</p>
            <p className="text-[10px] text-muted-foreground/70">點選後所有快速記帳套用此方式</p>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {TOP_PAYMENTS.map((m) => {
              const active = payment === m;
              const info = PAYMENT_METHODS[m];
              return (
                <button
                  key={m}
                  onClick={() => setPayment(m)}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl border-2 transition-all ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm scale-[1.02]"
                      : "border-border bg-card text-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="text-base leading-none">{info.icon}</span>
                  <span className={`text-[10px] font-medium leading-none ${active ? "" : "text-muted-foreground"}`}>
                    {info.label.replace("Pay", "").replace("Touch 'n ", "TnG").replace("WeChat Pay", "WeChat")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 2. 商品快捷按鈕：3 列緊湊網格 + 長按手勢調數量 ── */}
        {products.length > 0 ? (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">⚡ 點商品即記錄銷售</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground/70">長按 ↑+1 ↓−1</span>
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
                  <span className="text-base text-muted-foreground mr-2">{CURRENCIES_SYMBOL[currency]}</span>
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

const CURRENCIES_SYMBOL: Record<string, string> = {
  HKD: "HK$", TWD: "NT$", THB: "฿", MYR: "RM", SGD: "S$", USD: "US$",
};

// ─────────────────────────────────────────────────────────────
// ProductButton — 支援「點擊記 1 筆 / 長按向上滑 +1 / 向下滑 −1」
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
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);

  // 數量與手勢狀態
  const [quantity, setQuantity] = useState(1);
  const [gestureMode, setGestureMode] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [lastSwipeDir, setLastSwipeDir] = useState<"up" | "down" | null>(null);

  // 手勢追蹤 refs
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchMoveRef = useRef<{ x: number; y: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // 動態記錄的 txId 陣列（用於 −1 時撤銷最後一筆）
  const recentTxIdsRef = useRef<string[]>([]);

  // 清理 timer
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  // 真正記錄交易（quantity 筆）
  const recordTransaction = (qty: number) => {
    const txIds: string[] = [];
    for (let i = 0; i < qty; i++) {
      const txId = addTransaction({
        type: "income",
        amount: product.price,
        currency: currency as any,
        category: "sales",
        paymentMethod: payment,
        productId: product.id,
        note: qty > 1 ? `${product.name} x${qty}` : product.name,
        marketId: currentMarketId || undefined,
      });
      txIds.push(txId);
    }
    recentTxIdsRef.current = [...recentTxIdsRef.current, ...txIds].slice(-20);
    onConfirm(product.id);
    onRecord(txIds[0], qty > 1 ? `${product.name} x${qty}` : product.name, product.price * qty);
  };

  // ── 觸控事件 ──
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    swipeStartRef.current = { x: t.clientX, y: t.clientY };
    touchMoveRef.current = { x: t.clientX, y: t.clientY };
    // 啟動長按計時器（400ms）
    longPressTimerRef.current = setTimeout(() => {
      setGestureMode(true);
      setShowSwipeHint(true);
      // 觸覺回饋（支援的裝置）
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        (navigator as any).vibrate?.(30);
      }
      // 3 秒後隱藏提示
      setTimeout(() => setShowSwipeHint(false), 3000);
    }, 400);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchMoveRef.current = { x: t.clientX, y: t.clientY };
    if (!gestureMode || !swipeStartRef.current) return;

    const deltaY = t.clientY - swipeStartRef.current.y;
    const SWIPE_THRESHOLD = 25; // 滑動 25px 觸發一次

    if (Math.abs(deltaY) >= SWIPE_THRESHOLD) {
      if (deltaY < 0) {
        // 向上滑 +1
        setQuantity((q) => q + 1);
        setLastSwipeDir("up");
      } else {
        // 向下滑 −1（最低 1）
        setQuantity((q) => Math.max(1, q - 1));
        setLastSwipeDir("down");
      }
      // 重置起點，實現連續滑動
      swipeStartRef.current = { x: t.clientX, y: t.clientY };
      // 觸覺回饋
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        (navigator as any).vibrate?.(15);
      }
      // 提示動畫
      setTimeout(() => setLastSwipeDir(null), 200);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (gestureMode) {
      // 手勢模式結束 → 記錄 quantity 筆
      recordTransaction(quantity);
      setGestureMode(false);
      setShowSwipeHint(false);
      setQuantity(1);
      swipeStartRef.current = null;
      touchMoveRef.current = null;
    }
    // 非 gestureMode：不做任何事（onClick 會處理）
  };

  // ── 滑鼠事件（桌面版模擬手勢）──
  // 由於拖動時滑鼠可能離開按鈕，需用全域 mousemove/mouseup 監聽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
    // 啟動長按計時器
    longPressTimerRef.current = setTimeout(() => {
      setGestureMode(true);
      setShowSwipeHint(true);
      setTimeout(() => setShowSwipeHint(false), 3000);
      // 進入手勢模式後，挂載全域 mousemove/mouseup 監聽
      const onGlobalMove = (ev: MouseEvent) => {
        if (!swipeStartRef.current) return;
        const deltaY = ev.clientY - swipeStartRef.current.y;
        const SWIPE_THRESHOLD = 25;
        if (Math.abs(deltaY) >= SWIPE_THRESHOLD) {
          if (deltaY < 0) {
            setQuantity((q) => q + 1);
            setLastSwipeDir("up");
          } else {
            setQuantity((q) => Math.max(1, q - 1));
            setLastSwipeDir("down");
          }
          swipeStartRef.current = { x: ev.clientX, y: ev.clientY };
          setTimeout(() => setLastSwipeDir(null), 200);
        }
      };
      const onGlobalUp = (ev: MouseEvent) => {
        document.removeEventListener("mousemove", onGlobalMove);
        document.removeEventListener("mouseup", onGlobalUp);
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        // 用 functional update 確保拿到最新 quantity
        setQuantity((currentQty) => {
          recordTransaction(currentQty);
          return 1;
        });
        setGestureMode(false);
        setShowSwipeHint(false);
        swipeStartRef.current = null;
      };
      document.addEventListener("mousemove", onGlobalMove);
      document.addEventListener("mouseup", onGlobalUp);
    }, 400);
  };

  const handleMouseLeave = () => {
    // 滑鼠離開但還沒進入手勢模式 → 取消計時器
    // （進入手勢模式後由全域 listener 接手，不受 onMouseLeave 影響）
    if (!gestureMode && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // 手勢模式不觸發 click
    if (gestureMode) {
      e.preventDefault();
      return;
    }
    // 如果剛結束手勢模式（longPressTimerRef 剛被清掉但 gestureMode 還沒重置）
    // 用一個 flag 避免重複記錄
    recordTransaction(1);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      className={`relative bg-card border-2 rounded-xl p-2.5 text-center transition-all overflow-hidden min-h-[68px] flex flex-col justify-center select-none ${
        gestureMode
          ? "border-primary bg-primary/5 scale-[1.03] shadow-lg cursor-ns-resize"
          : confirming
          ? "border-emerald-500 bg-emerald-50 scale-[0.97]"
          : "border-primary/20 hover:border-primary active:scale-[0.95] cursor-pointer"
      }`}
    >
      {/* 確認狀態覆蓋 */}
      {confirming && !gestureMode && (
        <div className="absolute inset-0 bg-emerald-50/95 flex items-center justify-center toast-fade-in">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* 手勢模式覆蓋 */}
      {gestureMode && (
        <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center px-1">
          {/* 數量大字 */}
          <div className={`text-2xl font-bold tabular-nums transition-transform ${lastSwipeDir ? "scale-125" : "scale-100"} ${lastSwipeDir === "up" ? "text-emerald-600" : lastSwipeDir === "down" ? "text-rose-600" : "text-primary"}`}>
            ×{quantity}
          </div>
          {/* 總金額 */}
          <div className="text-[10px] text-muted-foreground tabular-nums mt-0.5">
            {formatCurrency(product.price * quantity, currency as any)}
          </div>
          {/* 滑動方向指示 */}
          {showSwipeHint && (
            <div className="absolute inset-0 flex flex-col items-center justify-between py-1 pointer-events-none">
              <div className={`text-[10px] font-medium transition ${lastSwipeDir === "up" ? "text-emerald-600 scale-110" : "text-muted-foreground/60"}`}>
                ↑ +1
              </div>
              <div className={`text-[10px] font-medium transition ${lastSwipeDir === "down" ? "text-rose-600 scale-110" : "text-muted-foreground/60"}`}>
                ↓ −1
              </div>
            </div>
          )}
        </div>
      )}

      {/* 預設狀態內容 */}
      {!gestureMode && (
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
        :global(.shake-once) {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
