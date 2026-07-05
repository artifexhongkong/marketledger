"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ── Types ──
export type CurrencyCode = "HKD" | "TWD" | "THB" | "MYR" | "SGD" | "USD";
export type TransactionType = "income" | "expense";
export type PaymentMethod =
  | "cash" | "payme" | "alipayhk" | "wechat_pay" | "fps"
  | "line_pay" | "truemoney" | "tng" | "stripe" | "other"
  | `custom_${string}`;

// 自訂支付方式資料結構
export interface CustomPaymentMethod {
  id: string;
  label: string;
  icon: string;
  color: string;
}
export type CategoryId =
  | "sales" | "ingredients" | "packaging" | "rent" | "utilities"
  | "transport" | "marketing" | "equipment" | "other_income" | "other_expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  category: CategoryId;
  paymentMethod?: PaymentMethod;
  productId?: string;
  note?: string;
  marketId?: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  categoryId: CategoryId;
}

export interface MarketData {
  id: string;
  name: string;
  nameEn: string;
  type: "night" | "weekend" | "pop-up" | "festival";
  city: "HK" | "TW" | "TH" | "MY" | "SG";
  location: string;
  schedule: string;
  boothCount: number;
  feeRange: string;
  description: string;
}

// ── Static data ──
export const CURRENCIES: Record<CurrencyCode, { symbol: string; locale: string }> = {
  HKD: { symbol: "HK$", locale: "zh-HK" },
  TWD: { symbol: "NT$", locale: "zh-TW" },
  THB: { symbol: "฿", locale: "th-TH" },
  MYR: { symbol: "RM", locale: "ms-MY" },
  SGD: { symbol: "$", locale: "en-SG" },
  USD: { symbol: "US$", locale: "en-US" },
};

export const CATEGORIES: { id: CategoryId; label: string; icon: string; type: TransactionType; color: string }[] = [
  { id: "sales", label: "銷售", icon: "💰", type: "income", color: "#059669" },
  { id: "other_income", label: "其他收入", icon: "📦", type: "income", color: "#10B981" },
  { id: "ingredients", label: "食材", icon: "🥬", type: "expense", color: "#E11D48" },
  { id: "packaging", label: "包裝", icon: "📦", type: "expense", color: "#F59E0B" },
  { id: "rent", label: "攤位費", icon: "🏪", type: "expense", color: "#DC2626" },
  { id: "utilities", label: "水電雜費", icon: "💡", type: "expense", color: "#0891B2" },
  { id: "transport", label: "交通", icon: "🚌", type: "expense", color: "#7C3AED" },
  { id: "marketing", label: "行銷", icon: "📢", type: "expense", color: "#DB2777" },
  { id: "equipment", label: "設備", icon: "🔧", type: "expense", color: "#65A30D" },
  { id: "other_expense", label: "其他支出", icon: "📝", type: "expense", color: "#6B7280" },
];

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string }> = {
  cash: { label: "現金", icon: "💵" },
  payme: { label: "PayMe", icon: "💳" },
  alipayhk: { label: "AlipayHK", icon: "🅰️" },
  wechat_pay: { label: "WeChat Pay", icon: "💬" },
  fps: { label: "FPS", icon: "⚡" },
  line_pay: { label: "LINE Pay", icon: "🟢" },
  truemoney: { label: "TrueMoney", icon: "🔵" },
  tng: { label: "Touch 'n Go", icon: "🟡" },
  stripe: { label: "Stripe", icon: "💳" },
  other: { label: "其他", icon: "📋" },
};

/**
 * 取得支付方式的顯示資訊（支援自訂支付方式）
 */
export function getPaymentMethodInfo(
  method: PaymentMethod | string | undefined,
  customMethods: CustomPaymentMethod[] = []
): { label: string; icon: string } {
  if (!method) return { label: "未知", icon: "💳" };
  const m = method as string;
  if (m.startsWith("custom_")) {
    const custom = customMethods.find((c) => `custom_${c.id}` === m);
    if (custom) return { label: custom.label, icon: custom.icon };
    return { label: "自訂", icon: "💳" };
  }
  const info = PAYMENT_METHODS[m as keyof typeof PAYMENT_METHODS];
  return info || { label: m, icon: "💳" };
}

export const DEFAULT_MARKETS: MarketData[] = [
  { id: "pmq", name: "PMQ 週末市集", nameEn: "PMQ Weekend Market", type: "weekend", city: "HK", location: "香港中環 PMQ", schedule: "週六-日 14:00-22:00", boothCount: 25, feeRange: "HK$30-50/天", description: "元創方文創市集" },
  { id: "jfflux", name: "JFFLUX 創意市集", nameEn: "JFFLUX Creative Market", type: "pop-up", city: "HK", location: "香港西九文化區", schedule: "每月不定", boothCount: 30, feeRange: "HK$20-40/天", description: "西九文化區創意市集" },
  { id: "d2place", name: "D2 Place 市集", nameEn: "D2 Place Market", type: "weekend", city: "HK", location: "香港旺角 D2 Place", schedule: "週六-日 12:00-20:00", boothCount: 20, feeRange: "HK$25-45/天", description: "旺角青年文創市集" },
  { id: "chatuchak", name: "乍都節週末市集", nameEn: "Chatuchak Weekend Market", type: "weekend", city: "TH", location: "曼谷乍都節公園", schedule: "週六-日 09:00-18:00", boothCount: 15000, feeRange: "THB 200-500/週", description: "東南亞最大週末市集" },
  { id: "cicada", name: "Cicada 創意市集", nameEn: "Cicada Market", type: "weekend", city: "TH", location: "清邁", schedule: "每週五-日", boothCount: 50, feeRange: "THB 500-1,500/天", description: "清邁知名文創市集" },
  { id: "pasar_malam", name: "Pasar Malam 夜市", nameEn: "Pasar Malam Night Market", type: "night", city: "MY", location: "馬來西亞各地", schedule: "每週不同日期夜晚", boothCount: 100, feeRange: "RM 15-50/天", description: "馬來西亞傳統夜市" },
];

// ── Helpers ──
export function formatCurrency(amount: number, currency: CurrencyCode = "HKD"): string {
  const { symbol, locale } = CURRENCIES[currency];
  return `${symbol}${amount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return isToday ? `今日 ${hh}:${mm}` : `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

// ── Stores ──
interface AppStore {
  // Settings
  currency: CurrencyCode;
  currentMarketId: string | null;
  demoSeeded: boolean;
  // Data
  transactions: Transaction[];
  products: Product[];
  markets: MarketData[];
  customPaymentMethods: CustomPaymentMethod[];
  // Actions
  setCurrency: (c: CurrencyCode) => void;
  setCurrentMarket: (id: string | null) => void;
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => string;
  deleteTransaction: (id: string) => void;
  clearAll: () => void;
  addProduct: (p: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
  addCustomPaymentMethod: (m: Omit<CustomPaymentMethod, "id">) => void;
  deleteCustomPaymentMethod: (id: string) => void;
  seedDemo: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      currency: "HKD",
      currentMarketId: null,
      demoSeeded: false,
      transactions: [],
      products: [],
      markets: DEFAULT_MARKETS,
      customPaymentMethods: [],

      setCurrency: (c) => set({ currency: c }),
      setCurrentMarket: (id) => set({ currentMarketId: id }),

      addTransaction: (t) => {
        const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        set((s) => ({
          transactions: [
            { ...t, id, createdAt: Date.now() },
            ...s.transactions,
          ],
        }));
        return id;
      },

      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      clearAll: () => set({ transactions: [] }),

      addProduct: (p) =>
        set((s) => ({
          products: [{ ...p, id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` }, ...s.products],
        })),

      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      addCustomPaymentMethod: (m) =>
        set((s) => ({
          customPaymentMethods: [
            ...s.customPaymentMethods,
            { ...m, id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` },
          ],
        })),

      deleteCustomPaymentMethod: (id) =>
        set((s) => ({
          customPaymentMethods: s.customPaymentMethods.filter((m) => m.id !== id),
        })),

      seedDemo: () => {
        const { demoSeeded, transactions, currency } = get();
        if (demoSeeded || transactions.length > 0) return;
        const now = Date.now();
        const samples: Omit<Transaction, "id" | "createdAt">[] = [
          { type: "income", amount: 2500, currency, category: "sales", paymentMethod: "cash", note: "賣手作餅乾", marketId: "pmq" },
          { type: "income", amount: 1800, currency, category: "sales", paymentMethod: "payme", note: "賣手工飾品", marketId: "pmq" },
          { type: "income", amount: 950, currency, category: "sales", paymentMethod: "fps", note: "賣果醬", marketId: "pmq" },
          { type: "expense", amount: 800, currency, category: "ingredients", paymentMethod: "cash", note: "進貨麵粉、奶油", marketId: "pmq" },
          { type: "expense", amount: 350, currency, category: "packaging", paymentMethod: "fps", note: "包裝盒", marketId: "pmq" },
          { type: "expense", amount: 200, currency, category: "rent", paymentMethod: "cash", note: "PMQ 攤位費", marketId: "pmq" },
        ];
        const txs: Transaction[] = samples.map((s, i) => ({
          ...s,
          id: `tx_demo_${i}`,
          createdAt: now - (samples.length - i) * 60_000,
        }));
        const demoProducts: Product[] = [
          { id: "prod_demo_1", name: "手作餅乾", price: 80, unit: "包", categoryId: "sales" },
          { id: "prod_demo_2", name: "手工飾品", price: 150, unit: "件", categoryId: "sales" },
          { id: "prod_demo_3", name: "果醬", price: 95, unit: "瓶", categoryId: "sales" },
          { id: "prod_demo_4", name: "咖啡", price: 35, unit: "杯", categoryId: "sales" },
        ];
        set({ transactions: txs, products: demoProducts, demoSeeded: true });
      },
    }),
    {
      name: "marketledger-preview",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as any))),
    }
  )
);

// ── Derived selectors ──
export function getTodayTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => isToday(t.createdAt));
}

export function getDailySummary(transactions: Transaction[]) {
  const today = getTodayTransactions(transactions);
  const income = today.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = today.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const byCategory: Record<string, number> = {};
  const byPayment: Record<string, number> = {};
  const byMarket: Record<string, number> = {};
  today.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    const m = t.paymentMethod || "cash";
    byPayment[m] = (byPayment[m] || 0) + t.amount;
    const mid = t.marketId || "unknown";
    byMarket[mid] = (byMarket[mid] || 0) + t.amount;
  });
  return {
    income,
    expense,
    profit: income - expense,
    count: today.length,
    byCategory,
    byPayment,
    byMarket,
    todayTransactions: today,
  };
}
