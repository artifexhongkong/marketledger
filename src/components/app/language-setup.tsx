"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Check, Globe } from "lucide-react";

export const LANGUAGES = [
  { code: "zh-TW", label: "繁體中文", native: "繁體中文", flag: "🇹🇼" },
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "ja", label: "日本語", native: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", native: "한국어", flag: "🇰🇷" },
];

export function LanguageSetup() {
  const { language, setLanguage, setLanguageInitialized } = useAppStore();
  const [selected, setSelected] = useState(language || "zh-TW");

  const handleConfirm = () => {
    setLanguage(selected);
    setLanguageInitialized(true);
  };

  return (
    <div className="flex flex-col h-full bg-background px-5 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg mx-auto mb-3">
          <Globe className="w-7 h-7 text-accent" strokeWidth={2.2} />
        </div>
        <h1 className="text-xl font-bold text-foreground">選擇語言</h1>
        <p className="text-xs text-muted-foreground mt-1">
          選擇你使用的語言，之後可隨時在設定中更改
        </p>
      </div>

      {/* 語言選擇 */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                className={`relative p-3 rounded-xl border-2 transition text-left ${
                  isSelected
                    ? "border-accent bg-accent/10"
                    : "border-border bg-card hover:border-accent/30"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{lang.flag}</span>
                  {isSelected && <Check className="w-4 h-4 text-accent" strokeWidth={3} />}
                </div>
                <p className="text-sm font-semibold text-foreground">{lang.native}</p>
                <p className="text-[10px] text-muted-foreground">{lang.label}</p>
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
