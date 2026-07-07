"use client";

import { useState } from "react";
import { useAppStore, getDailySummary, formatCurrency, formatDateTime, getCategoryInfo, getPaymentMethodInfo } from "@/lib/store";
import { groupTransactions } from "@/lib/tx-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, MapPin, ChevronRight, Receipt, TrendingUp, Wallet } from "lucide-react";
import { TxGroupCard } from "@/components/app/transactions-page";

export function HomePage() {
  const { transactions, currency, currentMarketId, markets, customPaymentMethods } = useAppStore();
  const summary = getDailySummary(transactions);
  const currentMarket = markets.find((m) => m.id === currentMarketId);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const PREVIEW_COUNT = 5;
  const todaySorted = summary.todayTransactions.slice().sort((a, b) => b.createdAt - a.createdAt);
  // 分組後取前 5 組
  const previewGroups = groupTransactions(todaySorted).slice(0, PREVIEW_COUNT);
  const avgOrder = summary.count > 0 ? Math.round(summary.income / summary.count) : 0;

  return (
    <div className="px-4 pb-6 space-y-4">
      {/* Header */}
      <div className="pt-4">
        <p className="text-[11px] text-muted-foreground">
          {new Date().toLocaleDateString("zh-TW", { month: "long", day: "numeric", weekday: "short" })}
        </p>
        <div className="flex items-center justify-between mt-0.5">
          <h1 className="text-xl font-bold text-foreground">今日概況</h1>
          {currentMarket && (
            <div className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-md">
              <MapPin className="w-3 h-3" />
              {currentMarket.name}
            </div>
          )}
        </div>
      </div>

      {/* Hero — 大數字淨利 */}
      <div className="bg-gradient-to-br from-primary to-primary/85 rounded-2xl p-4 text-primary-foreground shadow-lg">
        <p className="text-[11px] text-primary-foreground/60 uppercase tracking-wider">今日淨利</p>
        <p className="text-3xl font-bold tabular-nums mt-1">
          {summary.profit >= 0 ? "+" : "−"}{formatCurrency(Math.abs(summary.profit), currency)}
        </p>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px] text-primary-foreground/60">收</span>
            <span className="text-xs font-semibold tabular-nums">{formatCurrency(summary.income, currency)}</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-300" />
            <span className="text-[11px] text-primary-foreground/60">支</span>
            <span className="text-xs font-semibold tabular-nums">{formatCurrency(summary.expense, currency)}</span>
          </div>
        </div>
      </div>

      {/* Stat row — 橫向排列 */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="p-3 text-center">
          <Receipt className="w-4 h-4 text-muted-foreground mx-auto" />
          <p className="text-lg font-bold tabular-nums mt-1">{summary.count}</p>
          <p className="text-[10px] text-muted-foreground">交易筆數</p>
        </Card>
        <Card className="p-3 text-center">
          <Wallet className="w-4 h-4 text-muted-foreground mx-auto" />
          <p className="text-lg font-bold tabular-nums mt-1">{summary.count > 0 ? formatCurrency(avgOrder, currency) : "—"}</p>
          <p className="text-[10px] text-muted-foreground">平均客單</p>
        </Card>
        <Card className="p-3 text-center">
          <TrendingUp className="w-4 h-4 text-muted-foreground mx-auto" />
          <p className={`text-lg font-bold tabular-nums mt-1 ${summary.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {summary.profit >= 0 ? "+" : "−"}{Math.abs(summary.profit) > 999 ? `${(Math.abs(summary.profit) / 1000).toFixed(1)}k` : Math.abs(summary.profit)}
          </p>
          <p className="text-[10px] text-muted-foreground">淨利</p>
        </Card>
      </div>

      {/* 今日記錄 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-foreground">今日記錄</h2>
          <Badge variant="secondary" className="text-[10px]">{summary.count} 筆</Badge>
        </div>
        {previewGroups.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <p className="text-2xl mb-1">📊</p>
            <p className="text-xs text-muted-foreground">今日還沒有交易</p>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              {previewGroups.map((group) => (
                <TxGroupCard
                  key={group.id}
                  group={group}
                  currency={currency}
                  compact
                  isExpanded={expandedGroup === group.id}
                  onToggle={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                />
              ))}
            </div>
            {todaySorted.length > PREVIEW_COUNT && (
              <button onClick={() => window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "transactions" }))}
                className="w-full mt-1.5 py-2 flex items-center justify-center gap-1 text-[11px] font-medium text-primary bg-card border border-border rounded-lg hover:bg-primary/5">
                查看全部 {todaySorted.length} 筆 <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </>
        )}
      </div>

      {/* 分類 — 橫向 chips */}
      {Object.keys(summary.byCategory).length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-foreground mb-2">分類</h2>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(summary.byCategory).map(([catId, amount]) => {
              const cat = getCategoryInfo(catId);
              if (!cat) return null;
              return (
                <div key={catId} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border">
                  <span className="text-xs">{cat.icon}</span>
                  <span className="text-[11px] text-muted-foreground">{cat.label}</span>
                  <span className="text-xs font-bold tabular-nums"
                    style={{ color: cat.type === "income" ? "#059669" : "#E11D48" }}>
                    {cat.type === "income" ? "+" : "−"}{formatCurrency(amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
