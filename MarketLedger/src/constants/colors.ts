// 設計系統色板 — v2 現代專業金融風格

export const COLORS = {
  // 主色 — 深藍（取代原本的珊瑚橘）
  primary: '#0F1F3D',
  primaryLight: '#1E3A5F',
  primaryDark: '#0A1530',

  // 收入／利潤 — 翡翠綠
  income: '#059669',
  incomeLight: '#10B981',
  incomeBg: '#D1FAE5',

  // 支出 — 玫瑰紅
  expense: '#E11D48',
  expenseLight: '#F43F5E',
  expenseBg: '#FFE4E6',

  // 強調色 — 暖金
  accent: '#D4A574',
  accentLight: '#E5C9A0',
  accentBg: '#FEF3C7',

  // 背景
  background: '#FAFAF7',
  card: '#FFFFFF',
  cardPressed: '#F5F5F0',
  muted: '#F5F5F0',

  // 文字
  text: '#1A1F2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // 邊框
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // 分割線
  divider: '#F3F4F6',

  // 警示
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  success: '#10B981',
  successBg: '#D1FAE5',
  error: '#E11D48',
  errorBg: '#FFE4E6',

  // 陰影
  shadow: 'rgba(15, 31, 61, 0.08)',
} as const;

// 圓角
export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
} as const;

// 間距
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// 字體大小
export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  xxxl: 36,
} as const;

// 字體粗細
export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
