"use client";

import { useState } from "react";
import { useAppStore, formatCurrency, type MarketData } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, LayoutGrid, Tag, CheckCircle2, Sparkles, Handshake, Lock } from "lucide-react";

export function MarketsPage() {
  // 預覽模式：可切換查看未來設計草圖
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div className="px-5 pb-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">🌏 全球市集</h1>
        <p className="text-xs text-muted-foreground mt-1">探索世界各地的市集機會</p>
      </div>

      {/* Coming soon card — 主視覺 */}
      <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-primary/8 to-accent/10 p-6">
        {/* 裝飾光點 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/15 rounded-full blur-2xl translate-y-4 -translate-x-4" />

        <div className="relative">
          {/* Icon + 標籤 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Handshake className="w-4.5 h-4.5 text-primary" />
            </div>
            <Badge className="bg-accent/20 text-accent-foreground border-0 hover:bg-accent/20">
              <Sparkles className="w-3 h-3 mr-1" />
              功能開發中
            </Badge>
          </div>

          {/* 標題 */}
          <h2 className="text-lg font-semibold text-foreground leading-snug">
            全球市集功能
            <br />
            正在與各國市集主辦方洽談
          </h2>

          {/* 說明 */}
          <p className="text-xs text-muted-foreground leading-relaxed mt-3">
            我們正積極與香港 PMQ、JFFLUX、台灣簡單生活節、泰國 Chatuchak、馬來西亞 Pasar Malam 等市集主辦方接洽合作。完成後將提供：
          </p>

          {/* 未來功能清單 */}
          <ul className="mt-3 space-y-2">
            {[
              { icon: "🗺️", text: "全球市集行事曆與報名" },
              { icon: "📊", text: "各市集營業額情報" },
              { icon: "🤝", text: "線上攤位申請" },
              { icon: "💡", text: "市集比較與建議" },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5 text-xs text-foreground/80">
                <span className="w-6 h-6 rounded-md bg-card/80 flex items-center justify-center text-sm flex-shrink-0">
                  {item.icon}
                </span>
                <span>{item.text}</span>
                <Lock className="w-3 h-3 text-muted-foreground/60 ml-auto" />
              </li>
            ))}
          </ul>

          {/* 預估時間 */}
          <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">預計上線</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">V3 版本 · 2026 Q4</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="text-xs text-primary hover:text-primary hover:bg-primary/10"
            >
              {previewMode ? "收起預覽" : "查看設計草圖 →"}
            </Button>
          </div>
        </div>
      </Card>

      {/* 預覽模式：顯示未來設計草圖（半透明鎖定狀態） */}
      {previewMode && (
        <div>
          <p className="text-xs text-muted-foreground mb-3 italic flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            未來上線後的設計草圖預覽
          </p>
          <div className="relative opacity-50 pointer-events-none select-none">
            <PreviewMarketsList />
            <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
              <div className="bg-card/95 px-4 py-2 rounded-full border border-border shadow-lg flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">功能開發中</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 預先收集意見區 */}
      <Card className="p-4 border-dashed border-2">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
            <span className="text-sm">💡</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">想搶先體驗？</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              我們正在徵求 50 位種子用戶參與 Beta 測試，並優先獲得市集情報。如果你是市集主辦方或常態攤商，也歡迎與我們接洽合作。
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="text-xs h-8">
                加入 Beta 等候名單
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-8 text-primary">
                了解合作方案
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ── 預覽用的市集列表元件（從原本的 markets page 抽出，作為草圖展示）──
function PreviewMarketsList() {
  const { markets, currentMarketId, transactions, currency } = useAppStore();

  const getMarketStats = (id: string) => {
    const txs = transactions.filter((t) => t.marketId === id);
    const income = txs.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return { count: txs.length, profit: income - expense };
  };

  return (
    <div className="space-y-3">
      {markets.slice(0, 3).map((m) => {
        const stats = getMarketStats(m.id);
        const isCurrent = currentMarketId === m.id;
        return (
          <Card
            key={m.id}
            className={`p-4 ${isCurrent ? "border-primary border-2 bg-primary/5" : "border-border"}`}
          >
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium bg-primary/10 text-primary border-0">
                {CITY_LABELS[m.city]}
              </Badge>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                {TYPE_LABELS[m.type]}
              </Badge>
              {isCurrent && (
                <div className="ml-auto bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  已選中
                </div>
              )}
            </div>
            <h3 className="text-base font-semibold text-foreground">{m.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{m.nameEn}</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{m.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>{m.schedule}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <LayoutGrid className="w-3 h-3 flex-shrink-0" />
                <span>{m.boothCount.toLocaleString()} 個攤位</span>
                <span className="text-muted-foreground/60">·</span>
                <Tag className="w-3 h-3 flex-shrink-0" />
                <span>{m.feeRange}</span>
              </div>
            </div>
            {stats.count > 0 && (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">已記錄 {stats.count} 筆</span>
                <span className={`font-semibold tabular-nums ${stats.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {formatCurrency(stats.profit, currency)}
                </span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

const CITY_LABELS: Record<string, string> = {
  HK: "香港", TW: "台灣", TH: "泰國", MY: "馬來西亞", SG: "新加坡",
};

const TYPE_LABELS: Record<string, string> = {
  night: "夜市", weekend: "週末", "pop-up": "快閃", festival: "節慶",
};
