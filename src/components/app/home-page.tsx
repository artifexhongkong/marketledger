"use client";

import { useState } from "react";
import { useAppStore, getDailySummary, formatCurrency, formatDateTime, CATEGORIES, PAYMENT_METHODS } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, MapPin, ChevronDown, ChevronUp } from "lucide-react";

export function HomePage() {
  const { transactions, currency, currentMarketId, markets } = useAppStore();
  const summary = getDailySummary(transactions);
  const currentMarket = markets.find((m) => m.id === currentMarketId);
  const [showAllToday, setShowAllToday] = useState(false);
  const PREVIEW_COUNT = 5;
  const todaySorted = summary.todayTransactions.slice().sort((a, b) => b.createdAt - a.createdAt);
  const visibleToday = showAllToday ? todaySorted : todaySorted.slice(0, PREVIEW_COUNT);
  const hiddenCount = todaySorted.length - PREVIEW_COUNT;

  return (
    <div className="px-5 pb-4 space-y-5">
      {/* Greeting */}
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-wide">
          {new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1 text-foreground">
          今日營業概況
        </h1>
        {currentMarket && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-primary/8 text-primary px-2.5 py-1 rounded-full">
            <MapPin className="w-3 h-3" />
            {currentMarket.name}
          </div>
        )}
      </div>

      {/* Hero summary card */}
      <Card className="bg-primary border-primary text-primary-foreground overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative p-5">
          <p className="text-xs text-primary-foreground/70 tracking-wider uppercase">淨利潤</p>
          <p className="text-4xl font-bold tracking-tight mt-1 tabular-nums">
            {summary.profit >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(summary.profit), currency)}
          </p>
          <div className="flex items-center gap-3 mt-4 text-xs">
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-primary-foreground/70">收入</span>
              <span className="font-semibold tabular-nums">{formatCurrency(summary.income, currency)}</span>
            </div>
            <div className="w-px h-3 bg-primary-foreground/20" />
            <div className="flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-300" />
              <span className="text-primary-foreground/70">支出</span>
              <span className="font-semibold tabular-nums">{formatCurrency(summary.expense, currency)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">交易筆數</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-semibold mt-2 tabular-nums">{summary.count}</p>
          <p className="text-xs text-muted-foreground mt-0.5">筆交易</p>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">平均客單</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-amber-600 rotate-180" />
            </div>
          </div>
          <p className="text-2xl font-semibold mt-2 tabular-nums">
            {summary.count > 0 ? formatCurrency(Math.round(summary.income / summary.count), currency) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">每筆平均</p>
        </Card>
      </div>

      {/* Today's transactions (moved up — primary focus) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">今日營業記錄</h2>
          <Badge variant="secondary" className="text-xs font-medium">{summary.count} 筆</Badge>
        </div>
        {visibleToday.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm font-medium text-foreground">今日還沒有交易記錄</p>
            <p className="text-xs text-muted-foreground mt-1">前往「記帳」頁面開始記錄</p>
          </Card>
        ) : (
          <>
            <Card className="divide-y divide-border">
              {visibleToday.map((t) => {
                const cat = CATEGORIES.find((c) => c.id === t.category);
                const pay = t.paymentMethod ? PAYMENT_METHODS[t.paymentMethod] : null;
                return (
                  <div key={t.id} className="flex items-center gap-3 p-3.5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: (cat?.color || "#6B7280") + "15" }}
                    >
                      {cat?.icon || "📝"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{cat?.label || t.category}</p>
                        {pay && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground">
                            {pay.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(t.createdAt)}
                        {t.note && ` · ${t.note}`}
                      </p>
                    </div>
                    <span
                      className="text-sm font-semibold tabular-nums flex-shrink-0"
                      style={{ color: t.type === "income" ? "#059669" : "#E11D48" }}
                    >
                      {t.type === "income" ? "+" : "−"}
                      {t.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </Card>
            {/* 查看全部 / 收起 按鈕 */}
            {todaySorted.length > PREVIEW_COUNT && (
              <button
                onClick={() => setShowAllToday(!showAllToday)}
                className="w-full mt-2 py-2.5 flex items-center justify-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 bg-card border border-border rounded-lg transition hover:bg-primary/5"
              >
                {showAllToday ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    收起，只顯示前 {PREVIEW_COUNT} 筆
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    查看全部 {todaySorted.length} 筆（還有 {hiddenCount} 筆）
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Category breakdown (moved down — secondary info) */}
      {Object.keys(summary.byCategory).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-foreground">分類明細</h2>
          <Card className="divide-y divide-border">
            {Object.entries(summary.byCategory).map(([catId, amount]) => {
              const cat = CATEGORIES.find((c) => c.id === catId);
              if (!cat) return null;
              return (
                <div key={catId} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                      style={{ backgroundColor: cat.color + "15" }}
                    >
                      {cat.icon}
                    </div>
                    <span className="text-sm font-medium text-foreground">{cat.label}</span>
                  </div>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: cat.type === "income" ? "#059669" : "#E11D48" }}
                  >
                    {cat.type === "income" ? "+" : "−"}
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
