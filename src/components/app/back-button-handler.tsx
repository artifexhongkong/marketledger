"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { App as CapacitorApp } from "@capacitor/app";

/**
 * Android 返回鍵處理器
 *
 * 使用 Capacitor 官方 @capacitor/app 插件監聽 backButton 事件
 *
 * 放置位置：放在 page.tsx 的最頂層（Page 元件內部）
 * 因為需要存取當前的 tab 狀態和頁面導航邏輯
 *
 * 監聽器移除：Capacitor 的 addListener 回傳一個 PluginListenerHandle，
 * 在元件卸載時呼叫 handle.remove() 即可
 *
 * 返回鍵邏輯：
 * - 登入/語言/貨幣設定頁 → 攔截，不退出 App
 * - 帳號頁 → 設定頁
 * - 記帳/市集/記錄/報表/設定 → 首頁
 * - 首頁 → 顯示「再按一次退出」提示，2秒內再按退出 App
 */
interface BackButtonHandlerProps {
  /** 當前頁面 tab */
  tab: string;
  /** 是否已登入主畫面 */
  isMainApp: boolean;
  /** 切換 tab 的函數 */
  onTabChange: (tab: "home" | "settings" | "account") => void;
}

export function BackButtonHandler({ tab, isMainApp, onTabChange }: BackButtonHandlerProps) {
  const lastBackPressRef = useRef<number>(0);
  const [isNative, setIsNative] = useState(false);
  const [showExitHint, setShowExitHint] = useState(false);

  // 用 ref 存最新的 props，避免 listener 拿到舊值
  const tabRef = useRef(tab);
  const isMainAppRef = useRef(isMainApp);
  const onTabChangeRef = useRef(onTabChange);

  useEffect(() => { tabRef.current = tab; }, [tab]);
  useEffect(() => { isMainAppRef.current = isMainApp; }, [isMainApp]);
  useEffect(() => { onTabChangeRef.current = onTabChange; }, [onTabChange]);

  useEffect(() => {
    // 偵測是否在原生環境（Capacitor）
    const checkNative = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        setIsNative(Capacitor.isNativePlatform());
      } catch {
        setIsNative(false);
      }
    };
    checkNative();
  }, []);

  useEffect(() => {
    if (!isNative) return;

    let listener: { remove: () => void } | null = null;

    const setupListener = async () => {
      try {
        listener = await CapacitorApp.addListener("backButton", () => {
          const now = Date.now();

          // 登入/語言/貨幣設定頁 — 攔截返回鍵，不退出
          if (!isMainAppRef.current) {
            return;
          }

          const currentTab = tabRef.current;

          // 帳號頁 → 回到設定頁
          if (currentTab === "account") {
            onTabChangeRef.current("settings");
            return;
          }

          // 其他頁 → 回到首頁
          if (currentTab !== "home") {
            onTabChangeRef.current("home");
            return;
          }

          // 已在首頁 — 「再按一次退出」邏輯
          if (now - lastBackPressRef.current < 2000) {
            // 2秒內再按一次 → 退出 App
            CapacitorApp.exitApp();
          } else {
            // 第一次按 → 顯示提示
            lastBackPressRef.current = now;
            setShowExitHint(true);
            setTimeout(() => setShowExitHint(false), 2000);
          }
        });
      } catch (e) {
        console.error("[BackButton] 設定監聯器失敗:", e);
      }
    };

    setupListener();

    // 元件卸載時移除監聽器
    return () => {
      if (listener?.remove) {
        listener.remove();
      }
    };
  }, [isNative]);

  // 「再按一次退出」提示 UI
  if (showExitHint) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(26, 29, 36, 0.95)",
          color: "#C9A961",
          padding: "10px 20px",
          borderRadius: "8px",
          fontSize: "13px",
          zIndex: 99999,
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        再按一次返回鍵退出 App
      </div>
    );
  }

  return null;
}
