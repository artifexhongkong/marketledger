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

/** 計算總和 */
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

/** 四捨五入到小數點後 N 位 */
export function roundTo(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
