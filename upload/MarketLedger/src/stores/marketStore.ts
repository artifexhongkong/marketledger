import { create } from 'zustand';
import { MarketData } from '../constants';
import { DEFAULT_MARKETS } from '../constants';

interface MarketState {
  markets: MarketData[];
  addMarket: (market: Omit<MarketData, 'id'> & { id?: string }) => void;
  updateMarket: (id: string, data: Partial<MarketData>) => void;
  deleteMarket: (id: string) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  markets: DEFAULT_MARKETS,

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
    })),
}));
