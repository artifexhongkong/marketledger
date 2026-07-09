import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 會員方案
export type MembershipPlan = "free" | "pro" | "business";

// 會員狀態
export interface MembershipState {
  plan: MembershipPlan;
  // 訂閱到期時間（timestamp），null = 免費版或永久
  expiresAt: number | null;
  // 訂閱開始時間
  subscribedAt: number | null;
  // 是否為付費會員
  isPremium: boolean;

  // Actions
  setPlan: (plan: MembershipPlan) => void;
  subscribe: (plan: MembershipPlan) => void;
  cancelSubscription: () => void;
  checkExpiry: () => void;
}

// 方案名稱對應（顯示用）
export const PLAN_INFO: Record<MembershipPlan, {
  name: { "zh-TW": string; "zh-CN": string; en: string; ja: string; ko: string };
  price: string;
  color: string;
  icon: string;
}> = {
  free: {
    name: { "zh-TW": "免費版", "zh-CN": "免费版", en: "Free", ja: "無料版", ko: "무료" },
    price: "HK$0",
    color: "#6B7280",
    icon: "🆓",
  },
  pro: {
    name: { "zh-TW": "專業版", "zh-CN": "专业版", en: "Pro", ja: "プロ版", ko: "프로" },
    price: "HK$38/月",
    color: "#059669",
    icon: "⭐",
  },
  business: {
    name: { "zh-TW": "商業版", "zh-CN": "商业版", en: "Business", ja: "ビジネス版", ko: "비즈니스" },
    price: "HK$98/月",
    color: "#7C3AED",
    icon: "💼",
  },
};

// 免費版功能限制
export const FREE_PLAN_LIMITS = {
  maxTransactions: 30,        // 每月最多 30 筆交易
  maxProducts: 10,            // 最多 10 個商品
  maxMarkets: 3,              // 最多 3 個市集
  cloudBackup: false,         // 不支援雲端備份
  advancedReports: false,     // 不支援進階報表
  customCategories: false,    // 不支援自訂分類
  exportData: false,          // 不支援匯出資料
  multiDevice: false,         // 不支援多裝置同步
};

// Pro 版功能
export const PRO_PLAN_FEATURES = {
  maxTransactions: Infinity,
  maxProducts: 100,
  maxMarkets: 20,
  cloudBackup: true,
  advancedReports: true,
  customCategories: false,
  exportData: true,
  multiDevice: true,
};

// Business 版功能
export const BUSINESS_PLAN_FEATURES = {
  maxTransactions: Infinity,
  maxProducts: Infinity,
  maxMarkets: Infinity,
  cloudBackup: true,
  advancedReports: true,
  customCategories: true,
  exportData: true,
  multiDevice: true,
};

export const useMembershipStore = create<MembershipState>()(
  persist(
    (set, get) => ({
      plan: "free",
      expiresAt: null,
      subscribedAt: null,
      isPremium: false,

      setPlan: (plan) => {
        set({ plan, isPremium: plan !== "free" });
      },

      subscribe: (plan) => {
        const now = Date.now();
        const monthMs = 30 * 24 * 60 * 60 * 1000; // 30 天
        set({
          plan,
          isPremium: plan !== "free",
          subscribedAt: now,
          expiresAt: plan === "free" ? null : now + monthMs,
        });
      },

      cancelSubscription: () => {
        set({
          plan: "free",
          isPremium: false,
          expiresAt: null,
          subscribedAt: null,
        });
      },

      checkExpiry: () => {
        const { expiresAt, plan } = get();
        if (plan === "free" || !expiresAt) return;
        if (Date.now() > expiresAt) {
          // 過期，降級為免費版
          set({
            plan: "free",
            isPremium: false,
            expiresAt: null,
            subscribedAt: null,
          });
        }
      },
    }),
    {
      name: "marketledger-membership",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as any))),
    }
  )
);

// 取得目前方案的功能限制
export function getPlanLimits(plan: MembershipPlan) {
  switch (plan) {
    case "pro": return PRO_PLAN_FEATURES;
    case "business": return BUSINESS_PLAN_FEATURES;
    default: return FREE_PLAN_LIMITS;
  }
}

// 取得方案顯示名稱
export function getPlanName(plan: MembershipPlan, language: string): string {
  const lang = (language in PLAN_INFO[plan].name) ? language : "en";
  return PLAN_INFO[plan].name[lang as keyof typeof PLAN_INFO[MembershipPlan]["name"]];
}
