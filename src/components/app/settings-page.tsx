"use client";

import { useAppStore, CURRENCIES, type CurrencyCode } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { APP_VERSION, APP_VERSION_DISPLAY, GITHUB_RELEASES_API, GITHUB_RELEASES_PAGE, compareVersions } from "@/lib/version";
import { getExchangeRates } from "@/lib/exchange-rates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe, Download, Trash2, Info, Coins,
  ChevronRight, FileSpreadsheet, FileJson,
  RefreshCw, DownloadCloud, LogOut, CheckCircle2, AlertCircle, Loader2,
  Vibrate,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { haptic } from "@/lib/haptic";

interface LatestReleaseInfo {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  assets: { name: string; browser_download_url: string; size: number }[];
}

type VersionStatus = "idle" | "checking" | "latest" | "outdated" | "error";

export function SettingsPage() {
  const {
    currency, setCurrency,
    transactions, clearAll,
    hapticEnabled, hapticStrength,
    setHapticEnabled, setHapticStrength,
    exchangeRates, setExchangeRates,
  } = useAppStore();
  const { testUsername, testLogout } = useAuthStore();

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // 版本檢查狀態
  const [versionStatus, setVersionStatus] = useState<VersionStatus>("idle");
  const [latestRelease, setLatestRelease] = useState<LatestReleaseInfo | null>(null);
  const [checkError, setCheckError] = useState("");

  const checkUpdate = useCallback(async () => {
    setVersionStatus("checking");
    setCheckError("");
    try {
      // 加 timestamp 參數避免 GitHub CDN 快取
      const url = `${GITHUB_RELEASES_API}&_t=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 403 || res.status === 429) {
          throw new Error("GitHub API 存取頻率受限，請稍後再試");
        }
        if (res.status === 404) {
          throw new Error("尚未發布任何版本");
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data: LatestReleaseInfo[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("尚未發布任何版本");
      }
      // /releases 回傳陣列，第一筆就是最新版（按建立時間倒序）
      setLatestRelease(data[0]);
      const cmp = compareVersions(data[0].tag_name, APP_VERSION);
      setVersionStatus(cmp > 0 ? "outdated" : "latest");
    } catch (e: any) {
      setCheckError(e?.message || "檢查失敗");
      setVersionStatus("error");
    }
  }, []);

  // 進入設定頁時自動檢查一次
  useEffect(() => {
    checkUpdate();
  }, [checkUpdate]);

  const handleUpdate = () => {
    if (!latestRelease) return;
    // 找出 APK 下載連結
    const apkAsset = latestRelease.assets.find((a) => a.name.endsWith(".apk"));
    const url = apkAsset?.browser_download_url || latestRelease.html_url;
    // 在新視窗開啟下載頁
    window.open(url, "_blank");
  };

  const exportData = (format: "csv" | "json") => {
    if (transactions.length === 0) return alert("目前沒有交易記錄可以匯出");
    let content: string;
    let filename: string;
    if (format === "csv") {
      const header = "id,type,amount,currency,category,paymentMethod,note,marketId,createdAt\n";
      const rows = transactions.map((t) =>
        `"${t.id}","${t.type}",${t.amount},"${t.currency}","${t.category}","${t.paymentMethod ?? ""}","${t.note ?? ""}","${t.marketId ?? ""}",${new Date(t.createdAt).toISOString()}`
      ).join("\n");
      content = header + rows;
      filename = `marketledger_${Date.now()}.csv`;
    } else {
      content = JSON.stringify({ exportedAt: new Date().toISOString(), count: transactions.length, transactions }, null, 2);
      filename = `marketledger_${Date.now()}.json`;
    }
    const blob = new Blob([content], { type: format === "csv" ? "text/csv" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleClear = () => {
    clearAll();
    setShowClearConfirm(false);
    alert("已清除所有交易記錄");
  };

  const handleLogout = () => {
    if (confirm("確定要登出測試帳號嗎？")) {
      testLogout();
    }
  };

  return (
    <div className="px-5 pb-4 space-y-4">
      <h1 className="text-xl font-bold pt-4 text-foreground">設定</h1>

      {/* 測試帳號資訊 */}
      <SettingsGroup title="測試帳號">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{testUsername}</p>
            <p className="text-[10px] text-muted-foreground">已登入測試帳號</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-md hover:bg-rose-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            登出
          </button>
        </div>
      </SettingsGroup>

      {/* 偏好設定群組 */}
      <SettingsGroup title="偏好設定">
        <SettingsRow
          icon={Coins}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          label="幣別"
          value={`${CURRENCIES[currency].symbol} ${currency}`}
          onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
          expanded={showCurrencyPicker}
        >
          <div className="grid grid-cols-3 gap-2 pt-2">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
              <button
                key={code}
                onClick={() => { setCurrency(code); setShowCurrencyPicker(false); }}
                className={`py-2.5 rounded-lg text-xs font-medium transition border-2 ${
                  currency === code
                    ? "border-primary bg-primary/8 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/30"
                }`}
              >
                <div className="font-bold">{CURRENCIES[code].symbol}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{code}</div>
              </button>
            ))}
          </div>
          {/* 匯率資訊 */}
          {exchangeRates && currency !== "HKD" && exchangeRates[currency] && (
            <div className="mt-2 text-[10px] text-muted-foreground bg-muted/40 rounded-lg px-2.5 py-1.5">
              即時匯率：1 HKD = {exchangeRates[currency].toFixed(2)} {currency}
            </div>
          )}
          <button
            onClick={async () => {
              const rates = await getExchangeRates();
              if (rates) setExchangeRates(rates);
            }}
            className="mt-2 text-[10px] text-blue-600 hover:text-blue-700 font-medium"
          >
            更新匯率
          </button>
        </SettingsRow>

        {/* 震動回饋 */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Vibrate className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">震動回饋</p>
              <p className="text-[10px] text-muted-foreground">點擊按鈕、滑動商品時震動</p>
            </div>
            <button
              onClick={() => {
                const next = !hapticEnabled;
                setHapticEnabled(next);
                if (next) haptic("success");
              }}
              className={`w-10 h-6 rounded-full transition flex items-center ${hapticEnabled ? "bg-emerald-500 justify-end" : "bg-muted-foreground/30 justify-start"}`}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-sm mx-0.5" />
            </button>
          </div>

          {/* 強弱選擇（只在開啟時顯示） */}
          {hapticEnabled && (
            <div className="mt-3 pl-11">
              <p className="text-[10px] text-muted-foreground mb-1.5">震動強度</p>
              <div className="flex gap-1.5">
                {(["light", "medium", "strong"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setHapticStrength(s);
                      haptic("tap");
                    }}
                    className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition border-2 ${
                      hapticStrength === s
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border bg-card text-foreground hover:border-primary/30"
                    }`}
                  >
                    {s === "light" ? "輕" : s === "medium" ? "中" : "強"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => haptic("success")}
                className="mt-2 text-[10px] text-purple-600 hover:text-purple-700 font-medium"
              >
                測試震動
              </button>
            </div>
          )}
        </div>
      </SettingsGroup>

      {/* 資料管理群組 */}
      <SettingsGroup title="資料管理">
        <SettingsRow
          icon={Download}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          label="匯出資料"
          value={`${transactions.length} 筆交易`}
          onClick={() => setShowExportMenu(!showExportMenu)}
          expanded={showExportMenu}
        >
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => exportData("csv")}
              className="flex flex-col items-center gap-1 py-3 rounded-lg border-2 border-border bg-card hover:border-emerald-400 transition"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-medium text-foreground">CSV</span>
              <span className="text-[10px] text-muted-foreground">Excel 可用</span>
            </button>
            <button
              onClick={() => exportData("json")}
              className="flex flex-col items-center gap-1 py-3 rounded-lg border-2 border-border bg-card hover:border-emerald-400 transition"
            >
              <FileJson className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-medium text-foreground">JSON</span>
              <span className="text-[10px] text-muted-foreground">完整備份</span>
            </button>
          </div>
        </SettingsRow>

        <SettingsRow
          icon={Trash2}
          iconBg="bg-rose-100"
          iconColor="text-rose-600"
          label="清除資料"
          value="刪除所有交易記錄"
          onClick={() => setShowClearConfirm(true)}
          isLast
        />
      </SettingsGroup>

      {/* 應用更新群組 */}
      <SettingsGroup title="應用更新">
        <div className="px-4 py-3.5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              {versionStatus === "checking" ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : versionStatus === "latest" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : versionStatus === "outdated" ? (
                <AlertCircle className="w-4 h-4 text-amber-600" />
              ) : versionStatus === "error" ? (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              ) : (
                <Info className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">目前版本</p>
              <p className="text-[11px] text-muted-foreground">{APP_VERSION_DISPLAY}</p>
            </div>
            <button
              onClick={checkUpdate}
              disabled={versionStatus === "checking"}
              className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-md hover:bg-blue-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${versionStatus === "checking" ? "animate-spin" : ""}`} />
              重新檢查
            </button>
          </div>

          {/* 狀態訊息 */}
          {versionStatus === "latest" && (
            <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              ✓ 已是最新版本
            </div>
          )}
          {versionStatus === "outdated" && latestRelease && (
            <div className="space-y-2">
              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <p className="font-medium">發現新版本 {latestRelease.tag_name}</p>
                <p className="text-[10px] text-amber-600/80 mt-0.5">
                  發布於 {new Date(latestRelease.published_at).toLocaleDateString("zh-TW")}
                </p>
              </div>
              <Button
                onClick={handleUpdate}
                className="w-full h-9 text-xs font-medium"
              >
                <DownloadCloud className="w-3.5 h-3.5 mr-1" />
                下載更新
              </Button>
            </div>
          )}
          {versionStatus === "error" && (
            <div className="space-y-2">
              <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                檢查失敗：{checkError}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={checkUpdate}
                  variant="outline"
                  className="flex-1 h-9 text-xs font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  重試
                </Button>
                <Button
                  onClick={() => window.open(GITHUB_RELEASES_PAGE, "_blank")}
                  variant="outline"
                  className="flex-1 h-9 text-xs font-medium"
                >
                  <DownloadCloud className="w-3.5 h-3.5 mr-1" />
                  手動查看
                </Button>
              </div>
            </div>
          )}
          {versionStatus === "checking" && (
            <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              正在檢查最新版本...
            </div>
          )}
        </div>
      </SettingsGroup>

      {/* 關於群組 */}
      <SettingsGroup title="關於">
        <SettingsRow
          icon={Info}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          label="版本資訊"
          value={APP_VERSION_DISPLAY}
          onClick={() => setShowAbout(!showAbout)}
          expanded={showAbout}
          isLast
        >
          <div className="pt-2 space-y-2 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">開發者</span>
              <span className="text-foreground font-medium">ArtifexStudio</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">技術棧</span>
              <span className="text-foreground font-medium">Next.js · TypeScript · Zustand</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">更新日期</span>
              <span className="text-foreground font-medium">2026.07</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">版本標籤</span>
              <span className="text-foreground font-medium">{APP_VERSION}</span>
            </div>
          </div>
        </SettingsRow>
      </SettingsGroup>

      {/* 清除資料確認對話框 */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowClearConfirm(false)}>
          <Card className="w-full max-w-xs p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-2">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-base font-semibold text-foreground">清除所有資料？</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                將刪除 {transactions.length} 筆交易記錄與所有商品資料，此操作無法復原。
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 h-10"
              >
                取消
              </Button>
              <Button
                onClick={handleClear}
                className="flex-1 h-10 bg-rose-600 hover:bg-rose-700 text-white"
              >
                確認清除
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── 設定群組容器 ──
function SettingsGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
        {title}
      </p>
      <Card className="overflow-hidden divide-y divide-border">
        {children}
      </Card>
    </div>
  );
}

// ── 設定行項目（可展開）──
interface SettingsRowProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  onClick?: () => void;
  expanded?: boolean;
  isLast?: boolean;
  children?: React.ReactNode;
}

function SettingsRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  onClick,
  expanded,
  isLast,
  children,
}: SettingsRowProps) {
  return (
    <div>
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition text-left ${
          isLast && !expanded ? "" : ""
        }`}
      >
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
        {value && (
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">{value}</span>
        )}
        {children !== undefined && (
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${
            expanded ? "rotate-90" : ""
          }`} />
        )}
      </button>
      {expanded && children && (
        <div className="px-4 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}
