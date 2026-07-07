"use client";

import { useState, useEffect } from "react";
import { useAppStore, CURRENCIES, type CurrencyCode } from "@/lib/store";
import { getExchangeRates, getRateDisplay } from "@/lib/exchange-rates";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Globe } from "lucide-react";

export function CurrencySetup() {
  const { currency, setCurrency, setCurrencyInitialized, setExchangeRates } = useAppStore();
  const [selected, setSelected] = useState<CurrencyCode>(currency || "HKD");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExchangeRates().then((r) => {
      setRates(r);
      if (r) setExchangeRates(r);
      setLoading(false);
    });
  }, []);

  const handleConfirm = () => {
    setCurrency(selected);
    setCurrencyInitialized(true);
  };

  return (
    <div className="flex flex-col h-full bg-background px-5 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg mx-auto mb-3">
          <Globe className="w-7 h-7 text-accent" strokeWidth={2.2} />
        </div>
        <h1 className="text-xl font-bold text-foreground">選擇你的貨幣</h1>
        <p className="text-xs text-muted-foreground mt-1">
          選擇你主要使用的貨幣，之後可隨時在設定中更改
        </p>
      </div>

      {/* 匯率狀態 */}
      {loading ? (
        <p className="text-[11px] text-muted-foreground text-center mb-3">正在取得即時匯率...</p>
      ) : rates ? (
        <p className="text-[11px] text-emerald-600 text-center mb-3">✓ 已取得即時匯率</p>
      ) : (
        <p className="text-[11px] text-amber-600 text-center mb-3">無法取得匯率，將以港幣顯示</p>
      )}

      {/* 貨幣選擇 */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
            const info = CURRENCIES[code];
            const isSelected = selected === code;
            return (
              <button
                key={code}
                onClick={() => setSelected(code)}
                className={`relative p-3 rounded-xl border-2 transition text-left ${
                  isSelected
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:border-accent/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg font-bold text-foreground">{info.symbol}</span>
                  {isSelected && <Check className="w-4 h-4 text-accent" strokeWidth={3} />}
                </div>
                <p className="text-xs font-semibold text-foreground">{code}</p>
                {rates && code !== "HKD" && rates[code] && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    1 HKD = {rates[code].toFixed(2)} {code}
                  </p>
                )}
                {code === "HKD" && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">基準貨幣</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 確認按鈕 */}
      <Button
        onClick={handleConfirm}
        className="w-full h-11 font-semibold mt-4"
      >
        確認選擇
      </Button>
    </div>
  );
}
