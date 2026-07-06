"use client";

import { useEffect, useState } from "react";
import { Home, PencilLine, ClipboardList, Settings as SettingsIcon, Cloud, CloudOff, User, Tent } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { HomePage } from "@/components/app/home-page";
import { RecordPage } from "@/components/app/record-page";
import { TransactionsPage } from "@/components/app/transactions-page";
import { MarketsPage } from "@/components/app/markets-page";
import { SettingsPage } from "@/components/app/settings-page";
import { AuthPage } from "@/components/app/auth-section";

type TabId = "home" | "record" | "transactions" | "markets" | "settings" | "account";

const TABS: { id: TabId; label: string; icon: typeof Home; featured?: boolean }[] = [
  { id: "home", label: "首頁", icon: Home },
  { id: "record", label: "記帳", icon: PencilLine },
  { id: "markets", label: "市集", icon: Tent, featured: true },
  { id: "transactions", label: "記錄", icon: ClipboardList },
  { id: "settings", label: "設定", icon: SettingsIcon },
];

export default function Page() {
  const [tab, setTab] = useState<TabId>("home");
  const [hydrated, setHydrated] = useState(false);
  const seedDemo = useAppStore((s) => s.seedDemo);
  const cleanupOrphanedTxs = useAppStore((s) => s.cleanupOrphanedTxs);
  const migrateCategories = useAppStore((s) => s.migrateCategories);
  const { user, storageMode } = useAuthStore();

  useEffect(() => {
    setHydrated(true);
    migrateCategories(); // 一次性遷移：舊分類 ID → 新版精簡分類
    cleanupOrphanedTxs(); // 清理孤兒交易（已刪除市集的攤位費）
    seedDemo();
  }, [seedDemo, cleanupOrphanedTxs, migrateCategories]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as TabId;
      if (detail) setTab(detail);
    };
    window.addEventListener("navigate-tab", handler as EventListener);
    return () => window.removeEventListener("navigate-tab", handler as EventListener);
  }, []);

  // 帳號頁面是獨立覆蓋層
  const showAccount = tab === "account";

  return (
    <main className="min-h-screen bg-slate-200 flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-screen md:w-[390px] md:h-[780px] md:max-h-[calc(100vh-4rem)] md:rounded-[2.5rem] md:bg-slate-900 md:p-3 md:shadow-2xl md:shadow-slate-900/30"
        style={{ maxHeight: "100dvh" }}>
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-30" />

        <div className="w-full h-full bg-background md:rounded-[2rem] overflow-hidden flex flex-col relative">
          {/* Top app bar — 漸層 + 動態內容 */}
          {!showAccount && (
            <div className="flex-shrink-0 bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground relative overflow-hidden">
              {/* 裝飾光暈 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/8 rounded-full blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-xl" />

              <div className="relative flex items-center justify-between px-4 h-14">
                {/* 左側：頁面標題 */}
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight">
                    {TABS.find((t) => t.id === tab)?.label || "市集記賬本"}
                  </h2>
                </div>

                {/* 右側：帳號 + 儲存指示 */}
                <div className="flex items-center gap-2">
                  {user && (
                    <div className="flex items-center gap-1">
                      {storageMode === "drive" ? (
                        <Cloud className="w-4 h-4 text-accent" fill="currentColor" />
                      ) : (
                        <CloudOff className="w-4 h-4 text-primary-foreground/50" />
                      )}
                    </div>
                  )}
                  {/* 帳號頭像/登入按鈕 */}
                  <button onClick={() => setTab("account")} className="relative">
                    {user?.picture ? (
                      <img src={user.picture} alt="" className="w-7 h-7 rounded-full border border-accent/30" />
                    ) : user ? (
                      <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-accent" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center border border-accent/20">
                        <User className="w-4 h-4 text-accent/70" />
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 帳號頁面 — 獨立全螢幕 */}
          {showAccount ? (
            <AuthPage onBack={() => setTab("home")} />
          ) : (
            <>
              {/* Content area */}
              <div
                className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
                style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", touchAction: "pan-y" }}
              >
                {!hydrated ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">載入中...</div>
                ) : (
                  <>
                    {tab === "home" && <HomePage />}
                    {tab === "record" && <RecordPage />}
                    {tab === "transactions" && <TransactionsPage />}
                    {tab === "markets" && <MarketsPage />}
                    {tab === "settings" && <SettingsPage />}
                  </>
                )}
              </div>

              {/* Tab bar */}
              <div className="bg-card border-t border-border flex items-stretch justify-between px-1 pt-2 pb-5 flex-shrink-0 relative">
                {TABS.map(({ id, label, icon: Icon, featured }) => {
                  const active = tab === id;
                  if (featured) {
                    // 特色浮起按鈕：中間位置、香檳金圓盤、向上浮起
                    return (
                      <button key={id} onClick={() => setTab(id)}
                        className="flex-1 flex flex-col items-center gap-1 py-1 min-w-0 relative">
                        {/* 占位：與其他 tab 的圖示區同高，維持按鈕高度一致 */}
                        <div className="w-5 h-5" aria-hidden />
                        <span className={`text-[10px] transition truncate ${active ? "text-accent font-bold" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                        {/* 浮起圓盤 */}
                        <div
                          className={`absolute left-1/2 -translate-x-1/2 -top-3 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 bg-accent text-accent-foreground ${
                            active ? "scale-110 ring-4 ring-accent/20 shadow-accent/40" : "hover:scale-105 shadow-accent/25"
                          }`}
                        >
                          <Icon className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                      </button>
                    );
                  }
                  return (
                    <button key={id} onClick={() => setTab(id)}
                      className="flex-1 flex flex-col items-center gap-1 py-1 transition min-w-0">
                      <Icon className={`w-5 h-5 transition-all ${active ? "text-accent scale-110" : "text-muted-foreground"}`}
                        strokeWidth={active ? 2.5 : 2} />
                      <span className={`text-[10px] transition truncate ${active ? "text-accent font-semibold" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/80 rounded-full" />
        </div>
      </div>
    </main>
  );
}
