import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MarketData } from '../constants';
import { DEFAULT_MARKETS } from '../constants';
import { asyncStorage } from './storage';

interface MarketState {
  markets: MarketData[];
  // 目前選中的市集 id（用於記帳時自動帶入）
  currentMarketId: string | null;
  addMarket: (market: Omit<MarketData, 'id'> & { id?: string }) => void;
  updateMarket: (id: string, data: Partial<MarketData>) => void;
  deleteMarket: (id: string) => void;
  setCurrentMarket: (id: string | null) => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      markets: DEFAULT_MARKETS,
      currentMarketId: null,

      addMarket: (market) =>
        set((state) => ({
          markets: [
            ...state.markets,
            { ...market, id: market.id ?? `market_${Date.now()}` },
          ],
        })),

      updateMarket: (id, data) =>
        set((state) => ({
          markets: state.markets.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        })),

      deleteMarket: (id) =>
        set((state) => ({
          markets: state.markets.filter((m) => m.id !== id),
          currentMarketId: state.currentMarketId === id ? null : state.currentMarketId,
        })),

      setCurrentMarket: (id) => set({ currentMarketId: id }),
    }),
    {
      name: 'marketledger-markets',
      storage: asyncStorage,
    }
  )
);
