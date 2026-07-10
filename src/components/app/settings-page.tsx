"use client";

import { useAppStore, CURRENCIES, type CurrencyCode } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { APP_VERSION, APP_VERSION_DISPLAY, GITHUB_RELEASES_API, GITHUB_RELEASES_PAGE, compareVersions } from "@/lib/version";
import { LANGUAGES } from "@/components/app/language-setup";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe, Download, Trash2, Info, Coins,
  ChevronRight, FileSpreadsheet, FileJson,
  RefreshCw, DownloadCloud, LogOut, CheckCircle2, AlertCircle, Loader2,
  Vibrate, Moon, User,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { haptic } from "@/lib/haptic";
import { useT } from "@/lib/i18n";

interface LatestReleaseInfo {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  assets: { name: string; browser_download_url: string; size: number }[];
}

type VersionStatus = "idle" | "checking" | "latest" | "outdated" | "error";

export function SettingsPage() {
  const t = useT();
  const {
    currency, setCurrency,
    transactions, clearAll,
    products,
    hapticEnabled, hapticStrength,
    setHapticEnabled, setHapticStrength,
    darkMode, setDarkMode,
    language, setLanguage,
  } = useAppStore();
  const { testUsername, testLogout, user } = useAuthStore();

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showFreeExportMenu, setShowFreeExportMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [freeExportStatus, setFreeExportStatus] = useState<string | null>(null);
  const [freeExporting, setFreeExporting] = useState(false);

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
          throw new Error(t.settings_err_rate_limit);
        }
        if (res.status === 404) {
          throw new Error(t.settings_err_no_release);
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data: LatestReleaseInfo[] = await res.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(t.settings_err_no_release);
      }
      // /releases 回傳陣列，第一筆就是最新版（按建立時間倒序）
      setLatestRelease(data[0]);
      const cmp = compareVersions(data[0].tag_name, APP_VERSION);
      setVersionStatus(cmp > 0 ? "outdated" : "latest");
    } catch (e: any) {
      setCheckError(e?.message || t.settings_err_check_failed);
      setVersionStatus("error");
    }
  }, [t]);

  // 進入設定頁時自動檢查一次
  useEffect(() => {
    checkUpdate();
  }, [checkUpdate]);

  // 點擊「下載更新」直接開啟瀏覽器到 GitHub Release 頁面，避免 app 內下載 APK 失敗
  const handleUpdate = async () => {
    if (!latestRelease) return;
    const apkAsset = latestRelease.assets.find((a) => a.name.endsWith(".apk"));
    // 優先導向 APK 直接下載連結，否則退到 Release 頁面
    const url = apkAsset?.browser_download_url || latestRelease.html_url;
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url });
    } catch {
      window.open(url, "_blank");
    }
  };

  const exportData = (format: "csv" | "json") => {
    if (transactions.length === 0) return alert(t.settings_no_export);
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

  // ── 免費會員匯出（當日 CSV/TSV）──
  const [exportedPath, setExportedPath] = useState<string | null>(null);
  const [exportedInfo, setExportedInfo] = useState<{ count: number; total: number; format: string } | null>(null);

  const handleFreeExport = async (format: "csv" | "tsv") => {
    haptic("tap");
    setFreeExporting(true);
    setFreeExportStatus(null);
    setExportedPath(null);
    setExportedInfo(null);
    try {
      const { exportTodayData } = await import("@/lib/export-free");
      const result = await exportTodayData(transactions, products, format, t);
      if (result.success) {
        setExportedPath(result.path || null);
        setExportedInfo({
          count: result.count || 0,
          total: result.totalAmount || 0,
          format,
        });
        setFreeExportStatus(t.export_success);
      } else {
        setFreeExportStatus(result.message);
      }
      haptic(result.success ? "success" : "error");
    } catch (e) {
      setFreeExportStatus(t.export_failed + ": " + e);
      haptic("error");
    } finally {
      setFreeExporting(false);
    }
  };

  // 打開已匯出的檔案
  const handleOpenFile = async () => {
    if (!exportedPath) return;
    haptic("tap");
    try {
      const { openExportedFile } = await import("@/lib/export-free");
      const result = await openExportedFile(exportedPath, t);
      setFreeExportStatus(result.message);
      setTimeout(() => setFreeExportStatus(null), 3000);
    } catch (e) {
      setFreeExportStatus(t.export_open_failed + ": " + e);
    }
  };

  // 計算今日交易數
  const todayCount = transactions.filter((tx) =>
    new Date(tx.createdAt).toDateString() === new Date().toDateString()
  ).length;

  // 今日總金額
  const todayTotal = transactions
    .filter((tx) => new Date(tx.createdAt).toDateString() === new Date().toDateString())
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 是否已登入 Google
  const isGoogleLoggedIn = !!user;

  const handleClear = () => {
    clearAll();
    setShowClearConfirm(false);
    alert(t.settings_cleared);
  };

  const handleLogout = () => {
    if (confirm(t.settings_logout_confirm)) {
      testLogout();
    }
  };

  return (
    <div className="px-5 pb-4 space-y-4">
      <h1 className="text-xl font-bold pt-4 text-foreground">{t.settings_title}</h1>

      {/* 測試帳號資訊 */}
      <SettingsGroup title={t.settings_test_account}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{testUsername}</p>
            <p className="text-[10px] text-muted-foreground">{t.settings_logged_in}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-md hover:bg-rose-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            {t.settings_logout}
          </button>
        </div>
      </SettingsGroup>

      {/* Google 帳號 */}
      <SettingsGroup title={t.settings_google_account}>
        <SettingsRow
          icon={User}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label={t.settings_google_account}
          value={user ? user.email : ""}
          onClick={() => {
            haptic("tap");
            window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "account" }));
          }}
          isLast
        />
      </SettingsGroup>

      {/* 偏好設定群組 */}
      <SettingsGroup title={t.settings_preferences}>
        <SettingsRow
          icon={Coins}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          label={t.settings_currency}
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
        </SettingsRow>

        {/* 語言選擇 */}
        <SettingsRow
          icon={Globe}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label={t.settings_language}
          value={LANGUAGES.find((l) => l.code === language)?.native || language}
          onClick={() => { setShowLanguagePicker(!showLanguagePicker); setShowCurrencyPicker(false); }}
          expanded={showLanguagePicker}
        >
          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setShowLanguagePicker(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition ${
                  language === lang.code
                    ? "bg-primary/8 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.native}</span>
                {language === lang.code && <span className="ml-auto text-primary">✓</span>}
              </button>
            ))}
          </div>
        </SettingsRow>

        {/* 震動回饋 */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Vibrate className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{t.settings_haptic}</p>
              <p className="text-[10px] text-muted-foreground">{t.settings_haptic_desc}</p>
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
              <p className="text-[10px] text-muted-foreground mb-1.5">{t.settings_haptic_strength}</p>
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
                    {s === "light" ? t.settings_haptic_light : s === "medium" ? t.settings_haptic_medium : t.settings_haptic_strong}
                  </button>
                ))}
              </div>
              <button
                onClick={() => haptic("success")}
                className="mt-2 text-[10px] text-purple-600 hover:text-purple-700 font-medium"
              >
                {t.settings_haptic_test}
              </button>
            </div>
          )}
        </div>

        {/* Dark Mode 開關 */}
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
            <Moon className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{t.settings_dark_mode}</p>
            <p className="text-[10px] text-muted-foreground">{t.settings_dark_mode_desc}</p>
          </div>
          <button
            onClick={() => {
              const next = !darkMode;
              setDarkMode(next);
              if (typeof document !== "undefined") {
                document.documentElement.classList.toggle("dark", next);
              }
            }}
            className={`w-10 h-6 rounded-full transition flex items-center ${darkMode ? "bg-accent justify-end" : "bg-muted-foreground/30 justify-start"}`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow-sm mx-0.5" />
          </button>
        </div>
      </SettingsGroup>

      {/* 資料管理群組 */}
      <SettingsGroup title={t.settings_data_management}>
        {/* 免費會員匯出（當日 CSV/TSV）— 只在免費會員或未登入 Google 顯示 */}
        <SettingsRow
          icon={Download}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label={t.export_free_title}
          value={`${t.export_free_today} ${todayCount} ${t.export_records}`}
          onClick={() => setShowFreeExportMenu(!showFreeExportMenu)}
          expanded={showFreeExportMenu}
        >
          <div className="pt-2 space-y-3">
            <p className="text-[10px] text-muted-foreground px-1">{t.export_free_desc}</p>

            {/* 今日統計 */}
            <div className="grid grid-cols-2 gap-2 px-1">
              <div className="bg-muted/40 rounded-lg px-3 py-2">
                <p className="text-[10px] text-muted-foreground">{t.export_count_label}</p>
                <p className="text-sm font-bold text-foreground">{todayCount}</p>
              </div>
              <div className="bg-muted/40 rounded-lg px-3 py-2">
                <p className="text-[10px] text-muted-foreground">{t.export_total_label}</p>
                <p className="text-sm font-bold text-foreground">{todayTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Google 登入狀態提示 */}
            {!isGoogleLoggedIn && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <p className="text-[10px] text-amber-700">{t.export_ad_hint}</p>
              </div>
            )}

            {/* CSV / TSV 按鈕 */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleFreeExport("csv")}
                disabled={freeExporting || todayCount === 0}
                className="flex flex-col items-center gap-1 py-3 rounded-lg border-2 border-border bg-card hover:border-blue-400 transition disabled:opacity-50"
              >
                {freeExporting ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                )}
                <span className="text-xs font-medium text-foreground">{t.export_free_csv}</span>
                <span className="text-[10px] text-muted-foreground">{t.export_free_only}</span>
              </button>
              <button
                onClick={() => handleFreeExport("tsv")}
                disabled={freeExporting || todayCount === 0}
                className="flex flex-col items-center gap-1 py-3 rounded-lg border-2 border-border bg-card hover:border-blue-400 transition disabled:opacity-50"
              >
                {freeExporting ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <FileJson className="w-5 h-5 text-blue-600" />
                )}
                <span className="text-xs font-medium text-foreground">{t.export_free_tsv}</span>
                <span className="text-[10px] text-muted-foreground">{t.export_free_only}</span>
              </button>
            </div>

            {/* 匯出結果 */}
            {freeExportStatus && (
              <div className={`text-[11px] px-2 py-1.5 rounded-md ${
                freeExportStatus === t.export_success
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}>
                {freeExportStatus}
              </div>
            )}

            {/* 匯出後顯示檔案位置 + 打開檔案按鈕 */}
            {exportedPath && exportedInfo && (
              <div className="space-y-2">
                <div className="bg-muted/40 rounded-lg px-3 py-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{t.export_count_label}</span>
                    <span className="text-xs font-medium text-foreground">{exportedInfo.count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{t.export_total_label}</span>
                    <span className="text-xs font-medium text-foreground">{exportedInfo.total.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border/40 pt-1 mt-1">
                    <p className="text-[10px] text-muted-foreground">{t.export_location}</p>
                    <p className="text-[10px] text-foreground break-all">{exportedPath}</p>
                  </div>
                </div>
                <button
                  onClick={handleOpenFile}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {t.export_open_file}
                </button>
              </div>
            )}
          </div>
        </SettingsRow>

        <SettingsRow
          icon={Trash2}
          iconBg="bg-rose-100"
          iconColor="text-rose-600"
          label={t.settings_clear_data}
          value={t.settings_clear_desc}
          onClick={() => setShowClearConfirm(true)}
          isLast
        />
      </SettingsGroup>

      {/* 應用更新群組 */}
      <SettingsGroup title={t.settings_app_update}>
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
              <p className="text-sm font-medium text-foreground">{t.settings_current_version}</p>
              <p className="text-[11px] text-muted-foreground">{APP_VERSION_DISPLAY}</p>
            </div>
            <button
              onClick={checkUpdate}
              disabled={versionStatus === "checking"}
              className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 px-2.5 py-1.5 rounded-md hover:bg-blue-50 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${versionStatus === "checking" ? "animate-spin" : ""}`} />
              {t.settings_recheck}
            </button>
          </div>

          {/* 狀態訊息 */}
          {versionStatus === "latest" && (
            <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              ✓ {t.settings_latest}
            </div>
          )}
          {versionStatus === "outdated" && latestRelease && (
            <div className="space-y-2">
              <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <p className="font-medium">{t.settings_new_version} {latestRelease.tag_name}</p>
                <p className="text-[10px] text-amber-600/80 mt-0.5">
                  {t.settings_published} {new Date(latestRelease.published_at).toLocaleDateString("zh-TW")}
                </p>
              </div>
              <Button
                onClick={handleUpdate}
                className="w-full h-9 text-xs font-medium"
              >
                <DownloadCloud className="w-3.5 h-3.5 mr-1" />
                {t.settings_download_update}
              </Button>
              <p className="text-[9px] text-muted-foreground/70 text-center leading-relaxed">
                {t.settings_open_browser}
              </p>
            </div>
          )}
          {versionStatus === "error" && (
            <div className="space-y-2">
              <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {t.settings_check_failed}：{checkError}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={checkUpdate}
                  variant="outline"
                  className="flex-1 h-9 text-xs font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  {t.settings_retry}
                </Button>
                <Button
                  onClick={() => window.open(GITHUB_RELEASES_PAGE, "_blank")}
                  variant="outline"
                  className="flex-1 h-9 text-xs font-medium"
                >
                  <DownloadCloud className="w-3.5 h-3.5 mr-1" />
                  {t.settings_manual_check}
                </Button>
              </div>
            </div>
          )}
          {versionStatus === "checking" && (
            <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              {t.settings_checking}
            </div>
          )}
        </div>
      </SettingsGroup>

      {/* 關於群組 */}
      <SettingsGroup title={t.settings_about}>
        <SettingsRow
          icon={Info}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          label={t.settings_version_info}
          value={APP_VERSION_DISPLAY}
          onClick={() => setShowAbout(!showAbout)}
          expanded={showAbout}
          isLast
        >
          <div className="pt-2 space-y-2 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">{t.settings_developer}</span>
              <span className="text-foreground font-medium">ArtifexStudio</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">{t.settings_tech_stack}</span>
              <span className="text-foreground font-medium">Next.js · TypeScript · Zustand</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">{t.settings_update_date}</span>
              <span className="text-foreground font-medium">2026.07</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">{t.settings_version_tag}</span>
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
              <h3 className="text-base font-semibold text-foreground">{t.settings_clear_confirm_title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {t.settings_clear_confirm_msg.replace("{n}", String(transactions.length))}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 h-10"
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleClear}
                className="flex-1 h-10 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {t.settings_clear_confirm}
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
