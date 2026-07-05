"use client";

import { useEffect, useState } from "react";
import { Home, PencilLine, FileText, ClipboardList, MapPin, Settings as SettingsIcon, Cloud, CloudOff, History } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { HomePage } from "@/components/app/home-page";
import { RecordPage } from "@/components/app/record-page";
import { TransactionsPage } from "@/components/app/transactions-page";
import { DailyPage } from "@/components/app/daily-page";
import { MarketsPage } from "@/components/app/markets-page";
import { SettingsPage } from "@/components/app/settings-page";

type TabId = "home" | "record" | "transactions" | "daily" | "markets" | "settings";

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "首頁", icon: Home },
  { id: "record", label: "記帳", icon: PencilLine },
  { id: "daily", label: "歷史", icon: History },
  { id: "transactions", label: "記錄", icon: ClipboardList },
  { id: "markets", label: "市集", icon: MapPin },
  { id: "settings", label: "設定", icon: SettingsIcon },
];

/** 狀態列時間 — 客戶端挂載後才渲染，避免 hydration mismatch */
function StatusBarClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" }));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);
  // 伺服器渲染與首次客戶端渲染都先留白，等挂載後再填入時間
  return <span className="tabular-nums min-w-[44px]">{time ?? ""}</span>;
}

/** 頂部儲存模式指示器（雲端/本機） */
function StorageIndicator() {
  const { user, storageMode } = useAuthStore();
  if (!user) return null;
  return storageMode === "drive" ? (
    <Cloud className="w-4 h-4 text-primary-foreground" fill="currentColor" />
  ) : (
    <CloudOff className="w-4 h-4 text-primary-foreground/70" />
  );
}

export default function Page() {
  const [tab, setTab] = useState<TabId>("home");
  const [hydrated, setHydrated] = useState(false);
  const seedDemo = useAppStore((s) => s.seedDemo);

  useEffect(() => {
    setHydrated(true);
    seedDemo();
  }, [seedDemo]);

  // 監聽從其他頁面發出的導航事件（例如首頁「查看全部」按鈕）
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as TabId;
      if (detail && TABS.some((t) => t.id === detail)) {
        setTab(detail);
      }
    };
    window.addEventListener("navigate-tab", handler as EventListener);
    return () => window.removeEventListener("navigate-tab", handler as EventListener);
  }, []);

  return (
    <main className="min-h-screen bg-slate-200 flex items-center justify-center overflow-hidden">
      {/* 手機框架 — 在手機上填滿整個螢幕，在電腦上顯示固定大小 */}
      <div className="relative w-full h-screen md:w-[390px] md:h-[780px] md:max-h-[calc(100vh-4rem)] md:rounded-[2.5rem] md:bg-slate-900 md:p-3 md:shadow-2xl md:shadow-slate-900/30"
        style={{ maxHeight: "100dvh" }}
      >
        {/* Notch — 只在 md 以上顯示 */}
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-30" />

        {/* Screen */}
        <div className="w-full h-full bg-background md:rounded-[2rem] overflow-hidden flex flex-col relative">
            {/* Status bar */}
            <div className="h-11 bg-background flex items-end justify-between px-6 pb-1 text-xs font-semibold text-foreground flex-shrink-0">
              <StatusBarClock />
              <span className="flex items-center gap-1">
                <span>5G</span>
                <span className="inline-block w-5 h-2.5 border border-foreground rounded-sm relative">
                  <span className="absolute inset-0.5 bg-foreground rounded-[1px]" />
                </span>
              </span>
            </div>

            {/* Top app bar */}
            <div className="h-12 bg-primary text-primary-foreground flex items-center justify-between px-4 flex-shrink-0">
              <div className="w-6" />
              <h2 className="text-base font-semibold">
                {TABS.find((t) => t.id === tab)?.label}
              </h2>
              <div className="w-6 flex justify-end">
                <StorageIndicator />
              </div>
            </div>

            {/* Content area */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                touchAction: "pan-y",
              }}
            >
              {!hydrated ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  載入中...
                </div>
              ) : (
                <>
                  {tab === "home" && <HomePage />}
                  {tab === "record" && <RecordPage />}
                  {tab === "transactions" && <TransactionsPage />}
                  {tab === "daily" && <DailyPage />}
                  {tab === "markets" && <MarketsPage />}
                  {tab === "settings" && <SettingsPage />}
                </>
              )}
            </div>

            {/* Tab bar — 6 個 tab，緊湊排列 */}
            <div className="bg-card border-t border-border flex items-stretch justify-between px-1 pt-2 pb-5 flex-shrink-0">
              {TABS.map(({ id, label, icon: Icon }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className="flex-1 flex flex-col items-center gap-1 py-1 transition min-w-0"
                  >
                    <Icon
                      className={`w-5 h-5 transition ${active ? "text-primary" : "text-muted-foreground"}`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                    <span
                      className={`text-[10px] transition truncate ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/80 rounded-full" />
          </div>
        </div>
    </main>
  );
}
