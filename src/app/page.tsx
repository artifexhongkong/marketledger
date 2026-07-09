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
import { TopBar } from "@/components/app/top-bar";

type TabId = "home" | "record" | "transactions" | "markets" | "stats" | "settings" | "account";

const TAB_IDS: TabId[] = ["home", "record", "markets", "transactions", "stats", "settings"];

// Tab 對應的標題和圖示
const TAB_META: Record<string, { titleKey: keyof ReturnType<typeof useT>; icon: typeof Home }> = {
  home: { titleKey: "tab_home", icon: Home },
  record: { titleKey: "tab_record", icon: PencilLine },
  markets: { titleKey: "tab_markets", icon: MapPin },
  transactions: { titleKey: "tab_transactions", icon: ClipboardList },
  stats: { titleKey: "tab_stats", icon: BarChart3 },
  settings: { titleKey: "tab_settings", icon: SettingsIcon },
};

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
  const { testAuthed, user } = useAuthStore();
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

  // 取得當前 Tab 的標題和圖示
  const currentMeta = TAB_META[tab];
  const currentTitle = currentMeta ? t[currentMeta.titleKey] : t.tab_home;
  const CurrentIcon = currentMeta?.icon;

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
            <AuthPage onBack={() => setTab("home")} />
          ) : (
            <>
              {/* 新版頂部導航欄 — 滾動隱藏/顯示 */}
              <TopBar
                title={currentTitle}
                icon={CurrentIcon}
                userPicture={user?.picture}
                onAccountClick={() => setTab("account")}
                scrollContainerRef={scrollRef}
              />

              {/* Content area */}
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
