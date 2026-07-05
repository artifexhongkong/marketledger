import { create } from 'zustand';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

let nextProductId = 1;

export const useProductStore = create<ProductState>((set) => ({
  products: [],

  addProduct: (product) =>
    set((state) => ({
      products: [
        ...state.products,
        { ...product, id: String(nextProductId++) },
      ],
    })),

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
}));
