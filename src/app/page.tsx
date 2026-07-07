"use client";

import { useEffect, useState } from "react";
import { Home, PencilLine, ClipboardList, Settings as SettingsIcon, MapPin, BarChart3, Store, User } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { HomePage } from "@/components/app/home-page";
import { RecordPage } from "@/components/app/record-page";
import { TransactionsPage } from "@/components/app/transactions-page";
import { MarketsPage } from "@/components/app/markets-page";
import { StatsPage } from "@/components/app/stats-page";
import { SettingsPage } from "@/components/app/settings-page";
import { AuthPage } from "@/components/app/auth-section";
import { LoginScreen } from "@/components/app/login-screen";
import { CurrencySetup } from "@/components/app/currency-setup";

type TabId = "home" | "record" | "transactions" | "markets" | "stats" | "settings" | "account";

const TABS: { id: TabId; label: string; icon: typeof Home; featured?: boolean }[] = [
  { id: "home", label: "概況", icon: Home },
  { id: "record", label: "記帳", icon: PencilLine },
  { id: "markets", label: "市集", icon: MapPin },
  { id: "transactions", label: "記錄", icon: ClipboardList },
  { id: "stats", label: "報表", icon: BarChart3 },
  { id: "settings", label: "設定", icon: SettingsIcon },
];

export default function Page() {
  const [tab, setTab] = useState<TabId>("home");
  const [hydrated, setHydrated] = useState(false);
  const seedDemo = useAppStore((s) => s.seedDemo);
  const cleanupOrphanedTxs = useAppStore((s) => s.cleanupOrphanedTxs);
  const migrateCategories = useAppStore((s) => s.migrateCategories);
  const currencyInitialized = useAppStore((s) => s.currencyInitialized);
  const { testAuthed, user } = useAuthStore();

  useEffect(() => {
    setHydrated(true);
    migrateCategories();
    cleanupOrphanedTxs();
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

  // 未通過測試帳號登入 → 顯示登入畫面
  if (hydrated && !testAuthed) {
    return (
      <main className="min-h-screen bg-slate-200 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-screen md:w-[390px] md:h-[780px] md:max-h-[calc(100vh-4rem)] md:rounded-[2.5rem] md:bg-slate-900 md:p-3 md:shadow-2xl md:shadow-slate-900/30"
          style={{ maxHeight: "100dvh" }}>
          <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-30" />
          <div className="w-full h-full bg-background md:rounded-[2rem] overflow-hidden flex flex-col relative">
            <LoginScreen />
          </div>
        </div>
      </main>
    );
  }

  // 已登入但未選擇貨幣 → 顯示貨幣選擇畫面
  if (hydrated && testAuthed && !currencyInitialized) {
    return (
      <main className="min-h-screen bg-slate-200 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-screen md:w-[390px] md:h-[780px] md:max-h-[calc(100vh-4rem)] md:rounded-[2.5rem] md:bg-slate-900 md:p-3 md:shadow-2xl md:shadow-slate-900/30"
          style={{ maxHeight: "100dvh" }}>
          <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-30" />
          <div className="w-full h-full bg-background md:rounded-[2rem] overflow-hidden flex flex-col relative">
            <CurrencySetup />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-200 flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-screen md:w-[390px] md:h-[780px] md:max-h-[calc(100vh-4rem)] md:rounded-[2.5rem] md:bg-slate-900 md:p-3 md:shadow-2xl md:shadow-slate-900/30"
        style={{ maxHeight: "100dvh" }}>
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-30" />

        <div className="w-full h-full bg-background md:rounded-[2rem] overflow-hidden flex flex-col relative">
          {/* 帳號頁面 — 獨立全螢幕 */}
          {showAccount ? (
            <AuthPage onBack={() => setTab("home")} />
          ) : (
            <>
              {/* 頂部 bar — 極簡，logo + 帳號鈕 */}
              <div className="flex-shrink-0 bg-background/95 backdrop-blur-md flex items-center justify-between px-4 h-11">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                  <Store className="w-4 h-4 text-accent" strokeWidth={2.4} />
                </div>
                <button
                  onClick={() => setTab("account")}
                  className="w-8 h-8 rounded-full bg-accent/10 hover:bg-accent/20 flex items-center justify-center border border-accent/15 transition"
                  aria-label="帳號"
                >
                  {user?.picture ? (
                    <img src={user.picture} alt="" className="w-7 h-7 rounded-full" />
                  ) : (
                    <User className="w-4 h-4 text-accent" />
                  )}
                </button>
              </div>

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
                    {tab === "stats" && <StatsPage />}
                    {tab === "settings" && <SettingsPage />}
                  </>
                )}
              </div>

              {/* Tab bar */}
              <div className="bg-card flex items-stretch justify-between px-0.5 pt-2 pb-5 flex-shrink-0">
                {TABS.map(({ id, label, icon: Icon }) => {
                  const active = tab === id;
                  return (
                    <button key={id} onClick={() => {
                      // 離開記帳頁面時清空當前訂單（開始新一單）
                      if (tab === "record" && id !== "record") {
                        useAppStore.getState().clearOrder();
                      }
                      setTab(id);
                    }}
                      className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition min-w-0">
                      <Icon
                        className={`w-5 h-5 transition-all ${active ? "text-accent scale-110" : "text-muted-foreground"}`}
                        strokeWidth={active ? 2.5 : 2}
                      />
                      <span className={`text-[9px] transition truncate ${active ? "text-accent font-semibold" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
