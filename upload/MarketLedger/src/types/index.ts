// 幣別代碼
export type CurrencyCode = 'HKD' | 'TWD' | 'THB' | 'MYR' | 'SGD' | 'USD';

// 交易類型
export type TransactionType = 'income' | 'expense';

// 支付方式
export type PaymentMethod =
  | 'cash'       // 現金
  | 'payme'      // PayMe
  | 'alipayhk'   // AlipayHK
  | 'wechat_pay' // WeChat Pay HK
  | 'fps'        // FPS 轉帳
  | 'line_pay'   // LINE Pay
  | 'truemoney'  // TrueMoney
  | 'tng'        // Touch 'n Go
  | 'stripe'     // Stripe
  | 'other';

// 分類 ID
export type CategoryId =
  | 'sales'         // 銷售收入
  | 'ingredients'   // 食材成本
  | 'packaging'     // 包裝材料
  | 'rent'          // 攤位費
  | 'utilities'     // 水電雜費
  | 'transport'     // 交通費
  | 'marketing'     // 行銷推廣
  | 'equipment'     // 設備工具
  | 'other_income'  // 其他收入
  | 'other_expense'; // 其他支出

// 市集類型
export type MarketType = 'night' | 'weekend' | 'pop-up' | 'festival';

// 語言代碼
export type LanguageCode = 'zh_TW' | 'zh_CN' | 'en' | 'th' | 'ms';

// ── 交易記錄 ──

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

// ── 商品 ──

export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  categoryId: string;
}

// ── 市集 ──

export interface Market {
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
