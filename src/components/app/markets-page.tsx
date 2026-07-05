"use client";

import { useState } from "react";
import { useAppStore, formatCurrency, type MarketData } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, LayoutGrid, Tag, CheckCircle2 } from "lucide-react";

export function MarketsPage() {
  const { markets, currentMarketId, setCurrentMarket, transactions, currency } = useAppStore();
  const [filterCity, setFilterCity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = markets.filter((m) => {
    if (filterCity !== "all" && m.city !== filterCity) return false;
    if (filterType !== "all" && m.type !== filterType) return false;
    return true;
  });

  const handleSelect = (m: MarketData) => {
    setCurrentMarket(currentMarketId === m.id ? null : m.id);
  };

  const getMarketStats = (id: string) => {
    const txs = transactions.filter((t) => t.marketId === id);
    const income = txs.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return { count: txs.length, profit: income - expense };
  };

  return (
    <div className="px-5 pb-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">🌏 全球市集</h1>
        <p className="text-xs text-muted-foreground mt-1">點擊市集設為「當前市集」</p>
      </div>

      {/* Current market banner */}
      {currentMarketId && (
        <Card className="bg-primary/8 border-primary/30 p-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
          <p className="text-xs text-primary font-medium">
            當前市集：{markets.find((m) => m.id === currentMarketId)?.name}
          </p>
        </Card>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium w-10">城市</span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
            {[
              { k: "all", l: "全部" }, { k: "HK", l: "香港" }, { k: "TW", l: "台灣" },
              { k: "TH", l: "泰國" }, { k: "MY", l: "馬來西亞" }, { k: "SG", l: "新加坡" },
            ].map((c) => (
              <button
                key={c.k}
                onClick={() => setFilterCity(c.k)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  filterCity === c.k ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
                }`}
              >
                {c.l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium w-10">類型</span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
            {[
              { k: "all", l: "全部" }, { k: "night", l: "夜市" }, { k: "weekend", l: "週末" },
              { k: "pop-up", l: "快閃" }, { k: "festival", l: "節慶" },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setFilterType(t.k)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  filterType === t.k ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market list */}
      <div className="space-y-3">
        {filtered.map((m) => {
          const stats = getMarketStats(m.id);
          const isCurrent = currentMarketId === m.id;
          return (
            <Card
              key={m.id}
              onClick={() => handleSelect(m)}
              className={`p-4 cursor-pointer transition relative ${
                isCurrent ? "border-primary border-2 bg-primary/5" : "border-border hover:border-primary/40"
              }`}
            >
              {isCurrent && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">
                  已選中
                </div>
              )}
              <div className="flex items-start gap-2 mb-2">
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-medium bg-primary/10 text-primary border-0">
                  {CITY_LABELS[m.city]}
                </Badge>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                  {TYPE_LABELS[m.type]}
                </Badge>
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
    </div>
  );
}

const CITY_LABELS: Record<string, string> = {
  HK: "香港", TW: "台灣", TH: "泰國", MY: "馬來西亞", SG: "新加坡",
};

const TYPE_LABELS: Record<string, string> = {
  night: "夜市", weekend: "週末", "pop-up": "快閃", festival: "節慶",
};
