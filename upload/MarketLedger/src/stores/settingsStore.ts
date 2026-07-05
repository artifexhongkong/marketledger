import { create } from 'zustand';
import { CurrencyCode, LanguageCode } from '../types';
import { DEFAULT_CURRENCY } from '../constants';

interface SettingsState {
  currency: CurrencyCode;
  language: LanguageCode;
  setCurrency: (currency: CurrencyCode) => void;
  setLanguage: (language: LanguageCode) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  currency: DEFAULT_CURRENCY,
  language: 'zh_TW',

  setCurrency: (currency) => set({ currency }),
  setLanguage: (language) => set({ language }),
}));
