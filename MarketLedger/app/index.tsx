import { Redirect, Slot } from 'expo-router';
import { useSettingsStore } from '../src/stores/settingsStore';

/** 啟動頁：直接跳轉到首頁 */
export default function IndexPage() {
  // 讀取設定以確保 store 已初始化
  useSettingsStore();
  return <Redirect href="/(tabs)/home" />;
}
