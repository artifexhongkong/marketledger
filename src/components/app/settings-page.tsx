"use client";

import { useAppStore, CURRENCIES, type CurrencyCode, type LanguageCode } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Download, Trash2, Info, Coins } from "lucide-react";
import { AuthSection } from "./auth-section";

export function SettingsPage() {
  const {
    currency, language, setCurrency, setLanguage,
    transactions, clearAll,
  } = useAppStore();

  const languages: { key: LanguageCode; label: string }[] = [
    { key: "zh_TW", label: "繁體中文" },
    { key: "zh_CN", label: "簡體中文" },
    { key: "en", label: "English" },
    { key: "th", label: "ไทย" },
    { key: "ms", label: "Bahasa Melayu" },
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
  };

  const handleClear = () => {
    if (confirm(`確定要刪除所有 ${transactions.length} 筆交易記錄？此操作無法復原。`)) {
      clearAll();
      alert("已清除所有交易記錄");
    }
  };

  return (
    <div className="px-5 pb-4 space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight pt-2 text-foreground">設定</h1>

      {/* Google 登入與雲端備份 */}
      <section>
        <AuthSection />
      </section>

      {/* Currency */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Coins className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">幣別設定</h3>
        </div>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-3">
            目前選擇：{CURRENCIES[currency].symbol} ({currency})
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
              <button
                key={code}
                onClick={() => setCurrency(code)}
                className={`px-3 py-2 rounded-full text-xs font-medium transition ${
                  currency === code
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/70"
                }`}
              >
                {CURRENCIES[code].symbol} {code}
              </button>
            ))}
          </div>
        </Card>
      </section>

      {/* Language */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">語言設定</h3>
        </div>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-3">
            目前選擇：{languages.find((l) => l.key === language)?.label}
          </p>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang.key}
                onClick={() => setLanguage(lang.key)}
                className={`px-3 py-2 rounded-full text-xs font-medium transition ${
                  language === lang.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-muted/70"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/70 italic mt-3">
            ※ 多語系介面將於 V2 版本提供
          </p>
        </Card>
      </section>

      {/* Export */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Download className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">資料匯出</h3>
        </div>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground mb-3">
            共 {transactions.length} 筆交易記錄
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => exportData("csv")} className="h-12">
              <div className="text-center">
                <p className="text-xs font-semibold">📊 CSV</p>
                <p className="text-[10px] text-muted-foreground">Excel 可用</p>
              </div>
            </Button>
            <Button variant="outline" onClick={() => exportData("json")} className="h-12">
              <div className="text-center">
                <p className="text-xs font-semibold">📋 JSON</p>
                <p className="text-[10px] text-muted-foreground">完整備份</p>
              </div>
            </Button>
          </div>
        </Card>
      </section>

      {/* Danger zone */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Trash2 className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-semibold text-foreground">資料管理</h3>
        </div>
        <Card className="p-4 border-rose-200 bg-rose-50/50">
          <Button
            onClick={handleClear}
            variant="outline"
            className="w-full h-12 border-rose-300 text-rose-600 hover:bg-rose-100"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> 清除所有交易記錄
          </Button>
        </Card>
      </section>

      {/* About */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">關於</h3>
        </div>
        <Card className="divide-y divide-border">
          <div className="flex justify-between items-center p-4">
            <span className="text-sm text-muted-foreground">開發者</span>
            <span className="text-sm font-medium text-foreground">市集記賬本團隊</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className="text-sm text-muted-foreground">版本</span>
            <span className="text-sm font-medium text-foreground">1.0.1 (MVP)</span>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className="text-sm text-muted-foreground">技術棧</span>
            <span className="text-sm font-medium text-foreground text-right">Next.js<br/>TypeScript + Zustand</span>
          </div>
        </Card>
      </section>
    </div>
  );
}
