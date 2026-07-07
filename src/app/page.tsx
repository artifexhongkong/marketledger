"use client";

import { useEffect, useState } from "react";
import { Home, PencilLine, ClipboardList, Settings as SettingsIcon, MapPin } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { HomePage } from "@/components/app/home-page";
import { RecordPage } from "@/components/app/record-page";
import { TransactionsPage } from "@/components/app/transactions-page";
import { MarketsPage } from "@/components/app/markets-page";
import { SettingsPage } from "@/components/app/settings-page";
import { AuthPage } from "@/components/app/auth-section";
import { LoginScreen } from "@/components/app/login-screen";

type TabId = "home" | "record" | "transactions" | "markets" | "settings" | "account";

const TABS: { id: TabId; label: string; icon: typeof Home; featured?: boolean }[] = [
  { id: "home", label: "概況", icon: Home },
  { id: "record", label: "記帳", icon: PencilLine },
  { id: "markets", label: "市集", icon: MapPin, featured: true },
  { id: "transactions", label: "記錄", icon: ClipboardList },
  { id: "settings", label: "設定", icon: SettingsIcon },
];

export default function Page() {
  const [tab, setTab] = useState<TabId>("home");
  const [hydrated, setHydrated] = useState(false);
  const seedDemo = useAppStore((s) => s.seedDemo);
  const cleanupOrphanedTxs = useAppStore((s) => s.cleanupOrphanedTxs);
  const migrateCategories = useAppStore((s) => s.migrateCategories);
  const { testAuthed } = useAuthStore();

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

  // 未通過測試帳號登入 → 顯示登入畫面
  if (hydrated && !testAuthed) {
    return (
      <main className="min-h-screen bg-slate-200 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-screen md:w-[390px] md:h-[780px] md:max-h-[calc(100vh-4rem)] md:rounded-[2.5rem] md:bg-slate-900 md:p-3 md:shadow-2xl md:shadow-slate-900/30"
          style={{ maxHeight: "100dvh" }}>
          <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-30" />
          <div className="w-full h-full bg-background md:rounded-[2rem] overflow-hidden flex flex-col relative">
            <LoginScreen />
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/80 rounded-full" />
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
              {/* Content area — 直接從頂部開始，無頂部 bar */}
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
              <div className="bg-card flex items-stretch justify-between px-1 pt-2 pb-5 flex-shrink-0">
                {TABS.map(({ id, label, icon: Icon, featured }) => {
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
                      {featured ? (
                        // 市集：放大版金色圓形容器，圖示上文字下，白色
                        <div
                          className={`flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-full bg-accent shadow-lg shadow-accent/40 transition-all duration-200 ${
                            active ? "scale-105 ring-2 ring-accent/30 ring-offset-1 ring-offset-card" : "hover:scale-105"
                          }`}
                        >
                          <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                          <span className="text-[10px] font-bold text-white leading-none whitespace-nowrap">{label}</span>
                        </div>
                      ) : (
                        <>
                          <Icon
                            className={`w-5 h-5 transition-all ${active ? "text-accent scale-110" : "text-muted-foreground"}`}
                            strokeWidth={active ? 2.5 : 2}
                          />
                          <span className={`text-[10px] transition truncate ${active ? "text-accent font-semibold" : "text-muted-foreground"}`}>
                            {label}
                          </span>
                        </>
                      )}
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
