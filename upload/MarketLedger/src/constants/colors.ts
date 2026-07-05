// 設計系統色板

export const COLORS = {
  // 主色 — 暖橘（市集活力感）
  primary: '#FF6B35',
  primaryLight: '#FF8C5A',
  primaryDark: '#E55A25',

  // 收入／利潤 — 深綠
  income: '#2D6A4F',
  incomeLight: '#40916C',

  // 支出 — 珊瑚紅
  expense: '#E63946',
  expenseLight: '#FF6B6B',

  // 背景
  background: '#F8F9FA',
  card: '#FFFFFF',
  cardPressed: '#F0F0F0',

  // 文字
  text: '#1D3557',
  textSecondary: '#6C757D',
  textTertiary: '#ADB5BD',
  textInverse: '#FFFFFF',

  // 邊框
  border: '#E0E0E0',
  borderLight: '#F0F0F0',

  // 分割線
  divider: '#EEEEEE',

  // 警示
  warning: '#F4A261',
  success: '#2A9D8F',
  error: '#E63946',

  // 陰影
  shadow: 'rgba(0, 0, 0, 0.08)',
} as const;

// 圓角
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
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
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
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
