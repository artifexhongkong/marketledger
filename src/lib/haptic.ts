// 震動回饋 helper
// 依用戶設定（hapticEnabled + hapticStrength）調整震動模式
// 強弱對應：
//   light  → 短促輕震（10ms）
//   medium → 中等（20ms）
//   strong → 較強（35ms）
// 不同事件用不同 pattern：tap / success / warning / error

import { useAppStore } from "@/lib/store";

type HapticType = "tap" | "success" | "warning" | "error" | "tick";

const STRENGTH_MS: Record<"light" | "medium" | "strong", number> = {
  light: 8,
  medium: 18,
  strong: 35,
};

const PATTERNS: Record<HapticType, (ms: number) => number | number[]> = {
  tap: (ms) => ms,
  tick: (ms) => Math.max(5, ms - 5), // 數量變動更輕
  success: (ms) => [ms, 30, ms],
  warning: (ms) => [ms, 40, ms, 40, ms],
  error: (ms) => [ms, 50, ms, 50, ms, 50, ms],
};

export function haptic(type: HapticType = "tap") {
  if (typeof navigator === "undefined") return;
  if (!("vibrate" in navigator)) return;

  const state = useAppStore.getState();
  if (!state.hapticEnabled) return;

  const ms = STRENGTH_MS[state.hapticStrength] ?? STRENGTH_MS.medium;
  const pattern = PATTERNS[type](ms);

  try {
    navigator.vibrate(pattern);
  } catch {
    // 忽略震動失敗（某些瀏覽器/裝置不支援）
  }
}
