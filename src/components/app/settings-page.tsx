"use client";

import { useAppStore, CURRENCIES, type CurrencyCode, type LanguageCode } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Globe, Download, Trash2, Info, Coins,
  ChevronRight, FileSpreadsheet, FileJson,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

export function SettingsPage() {
  const {
    currency, language, setCurrency, setLanguage,
    transactions, clearAll,
  } = useAppStore();

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const languages: { key: LanguageCode; label: string; native: string }[] = [
    { key: "zh_TW", label: "繁體中文", native: "繁體中文" },
    { key: "zh_CN", label: "簡體中文", native: "简体中文" },
    { key: "en", label: "English", native: "English" },
    { key: "th", label: "泰文", native: "ไทย" },
    { key: "ms", label: "馬來文", native: "Bahasa Melayu" },
  ];

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

  const currentLang = languages.find((l) => l.key === language);

  return (
    <div className="px-5 pb-4 space-y-4">
      <h1 className="text-xl font-bold pt-4 text-foreground">設定</h1>

      {/* 偏好設定群組 */}
      <SettingsGroup title="偏好設定">
        <SettingsRow
          icon={Coins}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          label="幣別"
          value={`${CURRENCIES[currency].symbol} ${currency}`}
          onClick={() => { setShowCurrencyPicker(!showCurrencyPicker); setShowLanguagePicker(false); }}
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

        <SettingsRow
          icon={Globe}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="語言"
          value={currentLang?.native}
          onClick={() => { setShowLanguagePicker(!showLanguagePicker); setShowCurrencyPicker(false); }}
          expanded={showLanguagePicker}
          isLast
        >
          <div className="space-y-1 pt-2">
            {languages.map((lang) => (
              <button
                key={lang.key}
                onClick={() => { setLanguage(lang.key); setShowLanguagePicker(false); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${
                  language === lang.key
                    ? "bg-primary/8 text-primary font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span>{lang.native}</span>
                {language === lang.key && (
                  <span className="text-primary">✓</span>
                )}
              </button>
            ))}
            <p className="text-[10px] text-muted-foreground/60 italic px-3 pt-1">
              ※ 多語系介面將於 V2 版本提供
            </p>
          </div>
        </SettingsRow>
      </SettingsGroup>

      {/* 資料管理群組 */}
      <SettingsGroup title="資料管理">
        <SettingsRow
          icon={Download}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          label="匯出資料"
          value={`${transactions.length} 筆交易`}
          onClick={() => { setShowExportMenu(!showExportMenu); }}
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

      {/* 關於群組 */}
      <SettingsGroup title="關於">
        <SettingsRow
          icon={Info}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          label="版本資訊"
          value="v1.0.1"
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
