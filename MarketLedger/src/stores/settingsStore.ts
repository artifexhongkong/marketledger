import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CurrencyCode, LanguageCode } from '../types';
import { DEFAULT_CURRENCY } from '../constants';
import { asyncStorage } from './storage';

interface SettingsState {
  currency: CurrencyCode;
  language: LanguageCode;
  // 是否已經初始化過示範資料（避免每次重啟都加）
  demoSeeded: boolean;
  setCurrency: (currency: CurrencyCode) => void;
  setLanguage: (language: LanguageCode) => void;
  setDemoSeeded: (seeded: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      currency: DEFAULT_CURRENCY,
      language: 'zh_TW',
      demoSeeded: false,

      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setDemoSeeded: (demoSeeded) => set({ demoSeeded }),
    }),
    {
      name: 'marketledger-settings',
      storage: asyncStorage,
    }
  )
);
