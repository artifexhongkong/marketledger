// 共享常數和型別 — record-page 相關元件共用
import type { PaymentMethod, CurrencyCode } from "@/lib/store";

// 主要支付方式（前 5 個，置頂大按鈕，不滑動）
export const TOP_PAYMENTS: PaymentMethod[] = ["cash", "payme", "fps", "alipayhk", "wechat_pay"];

// 商品按鈕顏色選項（用於視覺分組）
export const PRODUCT_COLORS = [
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
export const EXTENDED_COLORS: string[] = [];
// 8 系飽和色（每系 6 個深淺）
export const COLOR_FAMILIES: { name: string; hues: string[] }[] = [
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
export const GRAYSCALE = ["#F3F4F6", "#D1D5DB", "#9CA3AF", "#6B7280", "#374151", "#111827"];

// 支付方式圖示和顏色選項（用於新增支付方式 Modal）
export const PAYMENT_ICONS = ["💵", "💳", "⚡", "💬", "🅰️", "🟢", "🔵", "🟡", "📱", "🏦", "💸", "💰", "🎁", "✅", "📌", "🎯"];
export const PAYMENT_COLORS = ["#1A1D24", "#059669", "#E11D48", "#F59E0B", "#7C3AED", "#0891B2", "#DB2777", "#65A30D", "#6B7280"];

// Toast 通知型別
export interface ToastState {
  id: string;
  txId: string;
  productName: string;
  amount: number;
  currency: CurrencyCode;
  timestamp: number;
}
