import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Zustand persist 用的 AsyncStorage 適配器 */
export const asyncStorage = createJSONStorage(() => AsyncStorage);
