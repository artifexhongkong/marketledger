"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore, CATEGORIES, PAYMENT_METHODS, formatCurrency } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Store, X, ChevronDown, Undo2, Check, RotateCcw } from "lucide-react";
import type { TransactionType, CategoryId, PaymentMethod, Transaction } from "@/lib/store";

export function RecordPage() {
  const [mode, setMode] = useState<"record" | "products">("record");
  return (
    <div className="px-5 pb-4 space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight pt-2 text-foreground">記帳</h1>

      {/* Mode toggle */}
      <div className="bg-muted p-1 rounded-xl flex">
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

      {mode === "record" ? <RecordView /> : <ProductsView />}
    </div>
  );
}

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
  const [txType, setTxType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId | "">("");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");
  const [showMarketPicker, setShowMarketPicker] = useState(false);

  // ── 點擊回饋相關 state ──
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lastTx, setLastTx] = useState<{ txId: string; productName: string; amount: number } | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredCats = CATEGORIES.filter((c) => c.type === txType);
  const currentMarket = markets.find((m) => m.id === currentMarketId);

  // 清理 timer 避免記憶體洩漏
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  const handleQuickProduct = (p: { id: string; name: string; price: number }) => {
    // 1. 立即加入交易，取得真實 txId
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

    // 2. 設定按鈕確認動畫
    setPressedId(p.id);
    setConfirmId(p.id);
    setTimeout(() => setConfirmId(null), 600);

    // 3. 顯示 Toast 通知（含撤銷按鈕）
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

    // 4. 5 秒後自動隱藏 Toast
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);

    // 清空手動記帳欄位
    setNote("");
    setAmount("");
  };

  // 撤銷最後一筆商品記錄
  const handleUndo = () => {
    if (!lastTx) return;
    // 直接用儲存的 txId 刪除（可靠，不需比對）
    deleteTransaction(lastTx.txId);
    setToast(null);
    setLastTx(null);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  };

  // 清除 Toast
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
  };

  return (
    <div className="space-y-5">
      {/* Toast 通知 — sticky 在內容區頂部（捲動時仍可見，不會跑出手機框外） */}
      {toast && (
        <div className="sticky top-0 z-50 -mx-5 px-3 pt-2 pb-1 bg-background/95 backdrop-blur-sm animate-[slideIn_0.3s_ease-out]">
          <div className="bg-card border border-emerald-200 shadow-lg rounded-2xl px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={3} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground leading-tight">已記錄銷售</p>
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

      {/* Quick product buttons */}
      {products.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">⚡ 點商品即記錄銷售</p>
            <p className="text-[10px] text-muted-foreground/70">點錯可立即撤銷</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {products.slice(0, 6).map((p) => {
              const isConfirming = confirmId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleQuickProduct(p)}
                  className={`relative bg-card border-2 rounded-xl p-3 text-left transition-all overflow-hidden ${
                    isConfirming
                      ? "border-emerald-500 bg-emerald-50 scale-[0.97]"
                      : "border-primary/20 hover:border-primary active:scale-[0.98]"
                  }`}
                >
                  {/* 確認狀態：顯示勾選覆蓋 */}
                  {isConfirming && (
                    <div className="absolute inset-0 bg-emerald-50/95 flex flex-col items-center justify-center gap-1 animate-[fadeIn_0.2s_ease-out]">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                      <p className="text-[10px] font-semibold text-emerald-700">已記錄</p>
                    </div>
                  )}
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-lg font-bold text-primary tabular-nums mt-0.5">
                    {formatCurrency(p.price, currency)}
                  </p>
                </button>
              );
            })}
          </div>

          {/* 最近記錄提示條 */}
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
      )}

      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => { setTxType("expense"); setCategory(""); }}
          className={`py-3 rounded-xl text-sm font-semibold transition ${
            txType === "expense" ? "bg-rose-600 text-white" : "bg-card border border-border text-muted-foreground"
          }`}
        >
          💸 支出
        </button>
        <button
          onClick={() => { setTxType("income"); setCategory(""); }}
          className={`py-3 rounded-xl text-sm font-semibold transition ${
            txType === "income" ? "bg-emerald-600 text-white" : "bg-card border border-border text-muted-foreground"
          }`}
        >
          💰 收入
        </button>
      </div>

      {/* Amount input */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">金額</p>
        <div className="bg-card border border-border rounded-xl flex items-center px-4 h-14">
          <span className="text-lg text-muted-foreground mr-2">{CURRENCIES_SYMBOL[currency]}</span>
          <Input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            type="decimal"
            inputMode="decimal"
            className="border-0 bg-transparent text-2xl font-bold p-0 h-auto focus-visible:ring-0 tabular-nums"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">分類</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {filteredCats.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border whitespace-nowrap text-sm font-medium transition ${
                category === c.id
                  ? "border-primary bg-primary/8 text-primary"
                  : "border-border bg-card text-foreground"
              }`}
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">支付方式</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {(Object.keys(PAYMENT_METHODS) as PaymentMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => setPayment(m)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full border whitespace-nowrap text-xs font-medium transition ${
                payment === m
                  ? "border-primary bg-primary/8 text-primary"
                  : "border-border bg-card text-foreground"
              }`}
            >
              <span>{PAYMENT_METHODS[m].icon}</span>
              {PAYMENT_METHODS[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* Market */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">市集</p>
        <button
          onClick={() => setShowMarketPicker(!showMarketPicker)}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between text-sm"
        >
          <span className="flex items-center gap-2 text-foreground">
            <Store className="w-4 h-4 text-muted-foreground" />
            {currentMarket ? currentMarket.name : "🌐 不指定市集"}
          </span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
        {showMarketPicker && (
          <Card className="mt-2 p-2 max-h-64 overflow-y-auto">
            <button
              onClick={() => { setCurrentMarket(null); setShowMarketPicker(false); }}
              className="w-full text-left p-2.5 hover:bg-muted rounded-lg text-sm"
            >
              🌐 不指定市集
            </button>
            {markets.map((m) => (
              <button
                key={m.id}
                onClick={() => { setCurrentMarket(m.id); setShowMarketPicker(false); }}
                className={`w-full text-left p-2.5 hover:bg-muted rounded-lg text-sm ${
                  currentMarketId === m.id ? "bg-primary/8 text-primary font-medium" : ""
                }`}
              >
                🏪 {m.name}
                <p className="text-xs text-muted-foreground mt-0.5">{m.location}</p>
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* Note */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-medium">備註（選填）</p>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="例如：客人買兩份、補貨..."
          className="bg-card resize-none min-h-[60px] text-sm"
          maxLength={100}
        />
      </div>

      <Button onClick={handleSubmit} size="lg" className="w-full h-12 text-base font-semibold">
        ✓ 完成記帳
      </Button>

      {/* 動畫 keyframes */}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeIn {
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
    <div className="space-y-4">
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
