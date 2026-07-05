import { Transaction } from '../types';
import { sum, roundTo } from './formatCurrency';

/** 計算指定交易的摘要數據 */
export function calculateDailySummary(transactions: Transaction[], _currency: string) {
  // 過濾今日交易
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

  // 按市集統計
  const byMarket: Record<string, number> = {};
  todayTransactions.forEach((t) => {
    const mid = t.marketId || 'unknown';
    byMarket[mid] = (byMarket[mid] || 0) + t.amount;
  });

  return {
    income: roundTo(income),
    expense: roundTo(expense),
    profit,
    transactionCount: todayTransactions.length,
    byCategory,
    byPaymentMethod,
    byMarket,
    todayTransactions,
  };
}

/** 計算指定市集的營業額統計（用於市集比較） */
export function calculateMarketSummary(transactions: Transaction[], marketId: string) {
  const marketTx = transactions.filter((t) => t.marketId === marketId);
  const income = sum(marketTx.filter((t) => t.type === 'income').map((t) => t.amount));
  const expense = sum(marketTx.filter((t) => t.type === 'expense').map((t) => t.amount));
  return {
    income,
    expense,
    profit: roundTo(income - expense),
    transactionCount: marketTx.length,
  };
}
