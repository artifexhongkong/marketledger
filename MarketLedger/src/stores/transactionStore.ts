import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, TransactionType, CategoryId, PaymentMethod, CurrencyCode } from '../types';
import { asyncStorage } from './storage';

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => string;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  clearAll: () => void;
  getTodayTransactions: (currency?: CurrencyCode) => Transaction[];
  getByCategory: (categoryId: CategoryId) => Transaction[];
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (data) => {
        const id = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const tx: Transaction = {
          ...data,
          id,
          createdAt: Date.now(),
        };
        set((state) => ({ transactions: [tx, ...state.transactions] }));
        return id;
      },

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

      clearAll: () => set({ transactions: [] }),

      getTodayTransactions: (currency) => {
        const { transactions } = get();
        const today = new Date();
        return transactions.filter((t) => {
          const td = new Date(t.createdAt);
          const sameDay =
            td.getFullYear() === today.getFullYear() &&
            td.getMonth() === today.getMonth() &&
            td.getDate() === today.getDate();
          return sameDay && (!currency || t.currency === currency);
        });
      },

      getByCategory: (categoryId) => {
        const { transactions } = get();
        return transactions.filter((t) => t.category === categoryId);
      },
    }),
    {
      name: 'marketledger-transactions',
      storage: asyncStorage,
    }
  )
);
