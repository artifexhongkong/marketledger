import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CategoryId } from '../types';
import { asyncStorage } from './storage';

interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => string;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: [],

      addProduct: (product) => {
        const id = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({
          products: [{ ...product, id }, ...state.products],
        }));
        return id;
      },

      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'marketledger-products',
      storage: asyncStorage,
    }
  )
);
