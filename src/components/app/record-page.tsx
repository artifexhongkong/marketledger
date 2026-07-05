"use client";

import { useState } from "react";
import { useAppStore, CATEGORIES, PAYMENT_METHODS, formatCurrency } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Store, X, ChevronDown } from "lucide-react";
import type { TransactionType, CategoryId, PaymentMethod } from "@/lib/store";

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

function RecordView() {
  const { currency, products, currentMarketId, markets, addTransaction, setCurrentMarket } = useAppStore();
  const [txType, setTxType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId | "">("");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");
  const [showMarketPicker, setShowMarketPicker] = useState(false);

  const filteredCats = CATEGORIES.filter((c) => c.type === txType);
  const currentMarket = markets.find((m) => m.id === currentMarketId);

  const handleQuickProduct = (p: { id: string; name: string; price: number }) => {
    addTransaction({
      type: "income",
      amount: p.price,
      currency,
      category: "sales",
      paymentMethod: payment,
      productId: p.id,
      note: p.name,
      marketId: currentMarketId || undefined,
    });
    setNote("");
    setAmount("");
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
      {/* Quick product buttons */}
      {products.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2 font-medium">⚡ 點商品即記錄銷售</p>
          <div className="grid grid-cols-2 gap-2">
            {products.slice(0, 6).map((p) => (
              <button
                key={p.id}
                onClick={() => handleQuickProduct(p)}
                className="bg-card border-2 border-primary/20 hover:border-primary rounded-xl p-3 text-left transition active:scale-[0.98]"
              >
                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                <p className="text-lg font-bold text-primary tabular-nums mt-0.5">{formatCurrency(p.price, currency)}</p>
              </button>
            ))}
          </div>
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
