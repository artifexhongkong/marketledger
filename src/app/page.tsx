"use client";

import { useEffect, useState } from "react";
import { Home, PencilLine, FileText, ClipboardList, MapPin, Settings as SettingsIcon } from "lucide-react";
import { useAppStore } from "@/lib/store";
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
  { id: "transactions", label: "記錄", icon: ClipboardList },
  { id: "daily", label: "日報", icon: FileText },
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
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-4 lg:p-8">
      {/* Header */}
      <div className="text-center mb-6 max-w-2xl">
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
          MarketLedger
          <span className="text-primary"> · </span>
          <span className="text-lg lg:text-xl font-medium text-slate-600">市集記賬本</span>
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          全球市集攤商的隨身營業助理 · 3 秒記一筆 · 收攤即結算
        </p>
        <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-amber-100/60 text-amber-700 text-xs rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          即時 UI 預覽 · 重新設計版本
        </div>
      </div>

      {/* Phone Frame */}
      <div className="relative">
        {/* Phone shell */}
        <div className="relative w-[390px] h-[780px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl shadow-slate-900/30">
          {/* Notch */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-30" />

          {/* Screen */}
          <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden flex flex-col relative">
            {/* Status bar */}
            <div className="h-11 bg-background flex items-end justify-between px-6 pb-1 text-xs font-semibold text-foreground">
              <StatusBarClock />
              <span className="flex items-center gap-1">
                <span>5G</span>
                <span className="inline-block w-5 h-2.5 border border-foreground rounded-sm relative">
                  <span className="absolute inset-0.5 bg-foreground rounded-[1px]" />
                </span>
              </span>
            </div>

            {/* Top app bar */}
            <div className="h-12 bg-primary text-primary-foreground flex items-center justify-center px-4 flex-shrink-0">
              <h2 className="text-base font-semibold">
                {TABS.find((t) => t.id === tab)?.label}
              </h2>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
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

        {/* Side annotations (visible on desktop) */}
        <div className="hidden xl:block absolute -right-80 top-12 w-72 space-y-3">
          <div className="bg-card rounded-xl p-4 shadow-lg border border-border">
            <p className="text-xs font-semibold text-primary mb-1">🎨 設計風格</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              現代專業金融風：深藍主色 (#0F1F3D)、溫暖留白、Inter 字體、tabular-nums 數字對齊。捨棄原本的珊瑚橘，改為更國際化、可信賴的視覺語言。
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-lg border border-border">
            <p className="text-xs font-semibold text-emerald-600 mb-1">✨ 即時互動</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              5 個 Tab 全部可點擊切換，記帳、商品管理、市集選擇、CSV/JSON 匯出皆可真實操作。資料使用 localStorage 持久化。
            </p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-lg border border-border">
            <p className="text-xs font-semibold text-amber-600 mb-1">💡 試試看</p>
            <ul className="text-xs text-muted-foreground space-y-1 leading-relaxed">
              <li>· 點「記帳」→ 點商品按鈕一鍵記帳</li>
              <li>· 點「市集」→ 選 PMQ 設為當前市集</li>
              <li>· 點「設定」→ 匯出 CSV 試試</li>
              <li>· 點「日報」看分類/支付/市集統計</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-400 mt-6 text-center max-w-md">
        這是網頁預覽版，實際 App 會在手機上以原生效能運行 · React Native + Expo
      </p>
    </main>
  );
}
