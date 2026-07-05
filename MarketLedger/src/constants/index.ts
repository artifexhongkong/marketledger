import { CurrencyCode, MarketType, CategoryId, PaymentMethod, LanguageCode } from '../types';

// ── 幣別設定 ──

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  rateToHKD: number; // 1 該幣別 = ? HKD
}

// 匯率為 2026 年參考值，實際使用時應從 API 動態更新
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  HKD: { code: 'HKD', symbol: 'HK$', locale: 'zh-HK', rateToHKD: 1 },
  TWD: { code: 'TWD', symbol: 'NT$', locale: 'zh-TW', rateToHKD: 0.24 },
  THB: { code: 'THB', symbol: '฿', locale: 'th-TH', rateToHKD: 0.22 },
  MYR: { code: 'MYR', symbol: 'RM', locale: 'ms-MY', rateToHKD: 1.70 },
  SGD: { code: 'SGD', symbol: 'S$', locale: 'en-SG', rateToHKD: 5.80 },
  USD: { code: 'USD', symbol: 'US$', locale: 'en-US', rateToHKD: 7.80 },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'HKD';

/** 將金額從某幣別換算到 HKD（用於跨幣別報表匯總） */
export function convertToHKD(amount: number, from: CurrencyCode): number {
  return amount * CURRENCIES[from].rateToHKD;
}

/** 將金額從 HKD 換算到某幣別 */
export function convertFromHKD(amount: number, to: CurrencyCode): number {
  return amount / CURRENCIES[to].rateToHKD;
}

// ── 分類設定 ──

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  type: 'income' | 'expense';
  color: string;
}

export const CATEGORIES: Category[] = [
  // 收入分類
  { id: 'sales', label: '銷售', icon: '💰', type: 'income', color: '#2D6A4F' },
  { id: 'other_income', label: '其他收入', icon: '📦', type: 'income', color: '#40916C' },
  // 支出分類
  { id: 'ingredients', label: '食材', icon: '🥬', type: 'expense', color: '#E63946' },
  { id: 'packaging', label: '包裝', icon: '📦', type: 'expense', color: '#F4A261' },
  { id: 'rent', label: '攤位費', icon: '🏪', type: 'expense', color: '#E76F51' },
  { id: 'utilities', label: '水電雜費', icon: '💡', type: 'expense', color: '#2A9D8F' },
  { id: 'transport', label: '交通', icon: '🚌', type: 'expense', color: '#264653' },
  { id: 'marketing', label: '行銷', icon: '📢', type: 'expense', color: '#E9C46A' },
  { id: 'equipment', label: '設備', icon: '🔧', type: 'expense', color: '#606C38' },
  { id: 'other_expense', label: '其他支出', icon: '📝', type: 'expense', color: '#6B705C' },
];

// ── 支付方式 ──

export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; icon: string }> = {
  cash: { label: '現金', icon: '💵' },
  payme: { label: 'PayMe', icon: '💳' },
  alipayhk: { label: 'AlipayHK', icon: '🅰️' },
  wechat_pay: { label: 'WeChat Pay', icon: '💬' },
  fps: { label: 'FPS', icon: '⚡' },
  line_pay: { label: 'LINE Pay', icon: '🟢' },
  truemoney: { label: 'TrueMoney', icon: '🔵' },
  tng: { label: 'Touch \'n Go', icon: '🟡' },
  stripe: { label: 'Stripe', icon: '💳' },
  other: { label: '其他', icon: '📋' },
};

// ── 預設市集資料（來自企劃書） ──

export interface MarketData {
  id: string;
  name: string;
  nameEn: string;
  type: MarketType;
  city: 'HK' | 'TW' | 'TH' | 'MY' | 'SG';
  location: string;
  schedule: string;
  boothCount: number;
  feeRange: string;
  description: string;
}

export const DEFAULT_MARKETS: MarketData[] = [
  {
    id: 'pmq',
    name: 'PMQ 週末市集',
    nameEn: 'PMQ Weekend Market',
    type: 'weekend',
    city: 'HK',
    location: '香港中環 PMQ',
    schedule: '週六-日 14:00-22:00',
    boothCount: 25,
    feeRange: 'HK$30-50/天',
    description: '元創方文創市集，年輕設計師與手工藝品聚集地',
  },
  {
    id: 'jfflux',
    name: 'JFFLUX 創意市集',
    nameEn: 'JFFLUX Creative Market',
    type: 'pop-up',
    city: 'HK',
    location: '香港西九文化區',
    schedule: '每月不定',
    boothCount: 30,
    feeRange: 'HK$20-40/天',
    description: '西九文化區創意市集，匯聚設計、手作、美食',
  },
  {
    id: 'd2place',
    name: 'D2 Place 市集',
    nameEn: 'D2 Place Market',
    type: 'weekend',
    city: 'HK',
    location: '香港旺角 D2 Place',
    schedule: '週六-日 12:00-20:00',
    boothCount: 20,
    feeRange: 'HK$25-45/天',
    description: '旺角青年文創市集，主打設計與潮流文化',
  },
  {
    id: 'chatuchak',
    name: '乍都節週末市集',
    nameEn: 'Chatuchak Weekend Market',
    type: 'weekend',
    city: 'TH',
    location: '曼谷乍都節公園',
    schedule: '週六-日 09:00-18:00',
    boothCount: 15000,
    feeRange: 'THB 200-500/週',
    description: '東南亞最大週末市集，超過 15,000 個攤位',
  },
  {
    id: 'cicada',
    name: 'Cicada 創意市集',
    nameEn: 'Cicada Market',
    type: 'weekend',
    city: 'TH',
    location: '清邁',
    schedule: '每週五-日',
    boothCount: 50,
    feeRange: 'THB 500-1,500/天',
    description: '清邁知名文創市集，融合藝術與文化',
  },
  {
    id: 'pasar_malam',
    name: 'Pasar Malam 夜市',
    nameEn: 'Pasar Malam Night Market',
    type: 'night',
    city: 'MY',
    location: '馬來西亞各地',
    schedule: '每週不同日期夜晚',
    boothCount: 100,
    feeRange: 'RM 15-50/天',
    description: '馬來西亞傳統夜市文化，美食與生活用品天堂',
  },
];
