import { CurrencyCode } from '../types';
import { CURRENCIES } from '../constants';

/** 格式化金額（帶幣別符號） */
export function formatCurrency(amount: number, currency: CurrencyCode = 'HKD'): string {
  const { symbol, locale } = CURRENCIES[currency];
  return `${symbol}${amount.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/** 格式化日期（今日 / MM/DD） */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  if (isToday) return '今日';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

/** 格式化完整日期時間 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${formatDate(timestamp)} ${hour}:${minute}`;
}

/** 計算總和 */
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

/** 四捨五入到小數點後 N 位 */
export function roundTo(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
