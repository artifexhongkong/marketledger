import { create } from 'zustand';
import { Transaction, TransactionType, CategoryId, PaymentMethod, CurrencyCode } from '../types';

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTodayTransactions: (currency?: CurrencyCode) => Transaction[];
  getByCategory: (categoryId: CategoryId) => Transaction[];
}

let nextId = 1;

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],

  addTransaction: (data) =>
    set((state) => ({
      transactions: [
        ...state.transactions,
        {
          ...data,
          id: String(nextId++),
          createdAt: Date.now(),
        },
      ],
    })),

  updateTransaction: (id, data) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),

  getTodayTransactions: (currency) => {
    const { transactions } = get();
    const today = new Date();
    return transactions.filter((t) => {
      const td = new Date(t.createdAt);
      return (
        td.getFullYear() === today.getFullYear() &&
        td.getMonth() === today.getMonth() &&
        td.getDate() === today.getDate()
      );
    });
  },

  getByCategory: (categoryId) => {
    const { transactions } = get();
    return transactions.filter((t) => t.category === categoryId);
  },
}));
