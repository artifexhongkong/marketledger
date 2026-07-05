import { Transaction } from '../types';
import { sum, roundTo } from './formatCurrency';

/** 計算今日摘要數據 */
export function calculateDailySummary(transactions: Transaction[], currency: string) {
  const todayTransactions = transactions.filter((t) => {
    const today = new Date();
    const tDate = new Date(t.createdAt);
    return (
      tDate.getFullYear() === today.getFullYear() &&
      tDate.getMonth() === today.getMonth() &&
      tDate.getDate() === today.getDate()
    );
  });

  const income = sum(todayTransactions.filter((t) => t.type === 'income').map((t) => t.amount));
  const expense = sum(todayTransactions.filter((t) => t.type === 'expense').map((t) => t.amount));
  const profit = roundTo(income - expense);

  // 按分類統計
  const byCategory: Record<string, number> = {};
  todayTransactions.forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

  // 按支付方式統計
  const byPaymentMethod: Record<string, number> = {};
  todayTransactions.forEach((t) => {
    const method = t.paymentMethod || 'cash';
    byPaymentMethod[method] = (byPaymentMethod[method] || 0) + t.amount;
  });

  return {
    income: roundTo(income),
    expense: roundTo(expense),
    profit,
    transactionCount: todayTransactions.length,
    byCategory,
    byPaymentMethod,
  };
}
