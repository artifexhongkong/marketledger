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

// 檢查是否在 Capacitor 原生平台（Android/iOS）
// web 環境下 Capacitor Haptics 的 API 會拋 "not implemented on web" 錯誤
function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  // Capacitor 6+ 在 window 上注入 Capacitor 物件
  const cap = (window as any).Capacitor;
  if (!cap) return false;
  if (typeof cap.isNativePlatform === "function") return cap.isNativePlatform();
  // fallback：檢查 platform
  return cap.platform === "android" || cap.platform === "ios";
}

// 動態載入 Capacitor Haptics（只在原生平台載入）
let capacitorHaptics: any = null;
let capacitorLoaded = false;
async function loadCapacitorHaptics() {
  // web 環境直接跳過，避免 "not implemented on web" 錯誤
  if (!isNativePlatform()) return null;
  if (capacitorLoaded) return capacitorHaptics;
  capacitorLoaded = true;
  try {
    // @ts-ignore - 動態載入
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

  // 只在原生平台用 Capacitor Haptics plugin
  const Haptics = await loadCapacitorHaptics();
  if (Haptics && isNativePlatform()) {
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

  // Fallback: navigator.vibrate（web + 部分手機）
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

// 同步版本（用於不能 await 的場合）
export function haptic(type: HapticType = "tap") {
  if (typeof navigator === "undefined" && typeof window === "undefined") return;
  const state = useAppStore.getState();
  if (!state.hapticEnabled) return;

  const strength = state.hapticStrength || "medium";
  const ms = { light: 8, medium: 18, strong: 35 }[strength];

  // 觸發 async 版本（不等待，web 環境會自動 fallback）
  hapticAsync(type).catch(() => {});

  // 同步 fallback（web 環境主要靠這個）
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    const pattern = PATTERNS[type](ms);
    try {
      navigator.vibrate(pattern);
    } catch {
      // 忽略
    }
  }
}
