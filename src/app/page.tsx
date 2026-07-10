"use client";

import { useEffect, useState, useRef } from "react";
import { Home, PencilLine, ClipboardList, Settings as SettingsIcon, MapPin, BarChart3 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { useT } from "@/lib/i18n";
import { HomePage } from "@/components/app/home-page";
import { RecordPage } from "@/components/app/record-page";
import { TransactionsPage } from "@/components/app/transactions-page";
import { MarketsPage } from "@/components/app/markets-page";
import { StatsPage } from "@/components/app/stats-page";
import { SettingsPage } from "@/components/app/settings-page";
import { AuthPage } from "@/components/app/auth-section";
import { LoginScreen } from "@/components/app/login-screen";
import { CurrencySetup } from "@/components/app/currency-setup";
import { LanguageSetup } from "@/components/app/language-setup";

type TabId = "home" | "record" | "transactions" | "markets" | "stats" | "settings" | "account";

const TAB_IDS: TabId[] = ["home", "record", "markets", "transactions", "stats", "settings"];

export default function Page() {
  const [tab, setTab] = useState<TabId>("home");
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const seedDemo = useAppStore((s) => s.seedDemo);
  const cleanupOrphanedTxs = useAppStore((s) => s.cleanupOrphanedTxs);
  const migrateCategories = useAppStore((s) => s.migrateCategories);
  const currencyInitialized = useAppStore((s) => s.currencyInitialized);
  const languageInitialized = useAppStore((s) => s.languageInitialized);
  const darkMode = useAppStore((s) => s.darkMode);
  const { testAuthed } = useAuthStore();
  const t = useT();

  const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
    { id: "home", label: t.tab_home, icon: Home },
    { id: "record", label: t.tab_record, icon: PencilLine },
    { id: "markets", label: t.tab_markets, icon: MapPin },
    { id: "transactions", label: t.tab_transactions, icon: ClipboardList },
    { id: "stats", label: t.tab_stats, icon: BarChart3 },
    { id: "settings", label: t.tab_settings, icon: SettingsIcon },
  ];

  useEffect(() => {
    setHydrated(true);
    migrateCategories();
    cleanupOrphanedTxs();
    seedDemo();
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, [seedDemo, cleanupOrphanedTxs, migrateCategories, darkMode]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as TabId;
      if (detail) setTab(detail);
    };
    window.addEventListener("navigate-tab", handler as EventListener);
    return () => window.removeEventListener("navigate-tab", handler as EventListener);
  }, []);

  // ── Android 返回鍵處理 ──
  // 監聽 popstate（Capacitor WebView 返回鍵會觸發 history.back）
  // 用 history.pushState 建立「虛擬歷史」，讓返回鍵不會直接退出 App
  useEffect(() => {
    // 只在已登入的主畫面處理（登入/語言/貨幣設定頁不攔截）
    if (!hydrated || !testAuthed || !languageInitialized || !currencyInitialized) return;

    // 建立一個虛擬歷史項目，讓返回鍵有東西可以「back」
    const state = { appInternal: true, tab };
    window.history.pushState(state, "");

    const handlePopState = (e: PopStateEvent) => {
      // 用 useState 的最新值需要透過 ref 或函數式更新
      setTab((currentTab) => {
        // 如果在帳號頁 → 回到設定頁
        if (currentTab === "account") {
          // 重新 push 一個虛擬歷史，讓下次返回鍵還能攔截
          window.history.pushState({ appInternal: true, tab: "settings" }, "");
          return "settings";
        }
        // 如果不在首頁 → 回到首頁
        if (currentTab !== "home") {
          window.history.pushState({ appInternal: true, tab: "home" }, "");
          return "home";
        }
        // 已在首頁 → 再按一次返回鍵就退出 App
        // 不再 push 歷史，讓下次 popstate 時 Capacitor 退出 App
        return currentTab;
      });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hydrated, testAuthed, languageInitialized, currencyInitialized, tab]);

  const showAccount = tab === "account";

  // 切換 Tab 時重置滾動位置
  const handleTabChange = (id: TabId) => {
    if (tab === "record" && id !== "record") {
      useAppStore.getState().clearOrder();
    }
    setTab(id);
    // 重置滾動到頂部
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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

  if (hydrated && testAuthed && !languageInitialized) {
    return (
      <main className="min-h-screen bg-slate-200 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-screen md:w-[390px] md:h-[780px] md:max-h-[calc(100vh-4rem)] md:rounded-[2.5rem] md:bg-slate-900 md:p-3 md:shadow-2xl md:shadow-slate-900/30"
          style={{ maxHeight: "100dvh" }}>
          <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-30" />
          <div className="w-full h-full bg-background md:rounded-[2rem] overflow-hidden flex flex-col relative">
            <LanguageSetup />
          </div>
        </div>
      </main>
    );
  }

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
            <AuthPage onBack={() => setTab("settings")} />
          ) : (
            <>
              {/* Content area — 無頂部 bar，內容直接從頂部開始 */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"
                style={{ WebkitOverflowScrolling: "touch", overscrollBehavior: "contain", touchAction: "pan-y" }}
              >
                {!hydrated ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">{t.loading}</div>
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
              <div className="bg-card flex items-stretch justify-between px-0.5 pt-2 pb-5 flex-shrink-0 border-t border-border/40">
                {TABS.map(({ id, label, icon: TabIcon }) => {
                  const active = tab === id;
                  return (
                    <button key={id} onClick={() => handleTabChange(id)}
                      className="flex-1 flex flex-col items-center justify-center gap-1 py-1 transition min-w-0">
                      <TabIcon
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
