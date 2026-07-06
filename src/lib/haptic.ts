// 震動回饋 helper
// 依用戶設定（hapticEnabled + hapticStrength）調整震動模式
// 強弱對應：
//   light  → 短促輕震
//   medium → 中等
//   strong → 較強
// 不同事件用不同 pattern：tap / success / warning / error / tick

import { useAppStore } from "@/lib/store";

type HapticType = "tap" | "success" | "warning" | "error" | "tick";

// Capacitor Haptics plugin 的 style 對應
const STYLE_MAP: Record<"light" | "medium" | "strong", "Light" | "Medium" | "Heavy"> = {
  light: "Light",
  medium: "Medium",
  strong: "Heavy",
};

// 不同事件的 pattern（給 navigator.vibrate 用）
const PATTERNS: Record<HapticType, (ms: number) => number | number[]> = {
  tap: (ms) => ms,
  tick: (ms) => Math.max(5, ms - 5),
  success: (ms) => [ms, 30, ms],
  warning: (ms) => [ms, 40, ms, 40, ms],
  error: (ms) => [ms, 50, ms, 50, ms, 50, ms],
};

// 動態載入 Capacitor Haptics（避免 web 環境載入失敗）
let capacitorHaptics: any = null;
let capacitorLoaded = false;
async function loadCapacitorHaptics() {
  if (capacitorLoaded) return capacitorHaptics;
  capacitorLoaded = true;
  try {
    // @ts-ignore - 動態載入，web 環境不存在也沒關係
    const mod = await import("@capacitor/haptics");
    capacitorHaptics = mod.Haptics || mod.default?.Haptics;
  } catch {
    capacitorHaptics = null;
  }
  return capacitorHaptics;
}

export async function hapticAsync(type: HapticType = "tap") {
  if (typeof navigator === "undefined" && typeof window === "undefined") return;

  const state = useAppStore.getState();
  if (!state.hapticEnabled) return;

  const strength = state.hapticStrength || "medium";

  // 優先用 Capacitor Haptics plugin（在 Android WebView 裡最可靠）
  const Haptics = await loadCapacitorHaptics();
  if (Haptics) {
    try {
      if (type === "success") {
        await Haptics.notification({ type: "SUCCESS" });
        return;
      }
      if (type === "warning") {
        await Haptics.notification({ type: "WARNING" });
        return;
      }
      if (type === "error") {
        await Haptics.notification({ type: "ERROR" });
        return;
      }
      // tap / tick 用 impact
      await Haptics.impact({ style: STYLE_MAP[strength] });
      return;
    } catch {
      // 失敗就 fallback 到 navigator.vibrate
    }
  }

  // Fallback: navigator.vibrate
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    const ms = { light: 8, medium: 18, strong: 35 }[strength];
    const pattern = PATTERNS[type](ms);
    try {
      navigator.vibrate(pattern);
    } catch {
      // 忽略
    }
  }
}

// 同步版本（用於不能 await 的場合，會 fallback 到 navigator.vibrate）
export function haptic(type: HapticType = "tap") {
  if (typeof navigator === "undefined") return;
  const state = useAppStore.getState();
  if (!state.hapticEnabled) return;

  const strength = state.hapticStrength || "medium";
  const ms = { light: 8, medium: 18, strong: 35 }[strength];

  // 觸發 async 版本（不等待）
  hapticAsync(type);

  // 同步 fallback
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    const pattern = PATTERNS[type](ms);
    try {
      navigator.vibrate(pattern);
    } catch {
      // 忽略
    }
  }
}
