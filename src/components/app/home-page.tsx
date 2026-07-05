"use client";

import { useState, useEffect } from "react";
import { useAppStore, getDailySummary, formatCurrency, formatDateTime, CATEGORIES, PAYMENT_METHODS } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, MapPin, FileText, ChevronRight } from "lucide-react";

export function HomePage() {
  const { transactions, currency, currentMarketId, markets } = useAppStore();
  const summary = getDailySummary(transactions);
  const currentMarket = markets.find((m) => m.id === currentMarketId);

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

      {/* Quick link to today's transactions page */}
      {summary.count > 0 && (
        <button
          onClick={() => {
            // 觸發自訂事件通知父層切換到 transactions tab
            window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "transactions" }));
          }}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between text-sm hover:bg-muted/50 transition group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">今日營業記錄</p>
              <p className="text-xs text-muted-foreground">{summary.count} 筆交易 · 點擊查看全部</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
        </button>
      )}

      {/* Category breakdown */}
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
