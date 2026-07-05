"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore, CATEGORIES, PAYMENT_METHODS, formatCurrency } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Store, X, ChevronDown, Undo2, Check, RotateCcw, SlidersHorizontal } from "lucide-react";
import type { TransactionType, CategoryId, PaymentMethod } from "@/lib/store";

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

        {/* ── 2. 商品快捷按鈕：3 列緊湊網格，更多商品一屏可見 ── */}
        {products.length > 0 ? (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">⚡ 點商品即記錄銷售</p>
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
            <div className="grid grid-cols-3 gap-2">
              {products.map((p) => {
                const isConfirming = confirmId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleQuickProduct(p)}
                    className={`relative bg-card border-2 rounded-xl p-2.5 text-center transition-all overflow-hidden min-h-[68px] flex flex-col justify-center ${
                      isConfirming
                        ? "border-emerald-500 bg-emerald-50 scale-[0.97]"
                        : "border-primary/20 hover:border-primary active:scale-[0.95]"
                    }`}
                  >
                    {isConfirming && (
                      <div className="absolute inset-0 bg-emerald-50/95 flex items-center justify-center toast-fade-in">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                    <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{p.name}</p>
                    <p className="text-sm font-bold text-primary tabular-nums mt-1 leading-none">
                      {formatCurrency(p.price, currency)}
                    </p>
                  </button>
                );
              })}
            </div>
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

function ProductsView() {
  const { products, currency, addProduct, deleteProduct } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("個");

  const handleAdd = () => {
    const p = parseFloat(price);
    if (!name.trim()) return alert("請輸入商品名稱");
    if (!p || p <= 0) return alert("請輸入有效單價");
    addProduct({ name: name.trim(), price: p, unit: unit.trim() || "個", categoryId: "sales" });
    setName(""); setPrice(""); setUnit("個"); setShowForm(false);
  };

  return (
    <div className="px-5 space-y-4">
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
        <div className="space-y-2">
          {products.map((p) => (
            <Card
              key={p.id}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition"
              onClick={() => {
                if (confirm(`刪除商品「${p.name}」？`)) deleteProduct(p.id);
              }}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatCurrency(p.price, currency)} / {p.unit}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">長按刪除</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
