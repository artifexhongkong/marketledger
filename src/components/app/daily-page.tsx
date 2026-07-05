"use client";

import { useAppStore, getDailySummary, formatCurrency, CATEGORIES, PAYMENT_METHODS, formatDateTime } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function DailyPage() {
  const { transactions, currency, markets } = useAppStore();
  const summary = getDailySummary(transactions);
  const todayTx = summary.todayTransactions.slice().sort((a, b) => b.createdAt - a.createdAt);

  const groupedByCategory: Record<string, typeof transactions> = {};
  summary.todayTransactions.forEach((t) => {
    if (!groupedByCategory[t.category]) groupedByCategory[t.category] = [];
    groupedByCategory[t.category].push(t);
  });

  return (
    <div className="px-5 pb-4 space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight pt-2 text-foreground">今日日報</h1>

      {/* Hero summary */}
      <Card className="bg-primary border-primary text-primary-foreground overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative p-5">
          <p className="text-xs text-primary-foreground/70 tracking-wider uppercase">淨利潤</p>
          <p className="text-4xl font-bold tracking-tight mt-1 tabular-nums">
            {summary.profit >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(summary.profit), currency).replace(/^[A-Z]{2}\$/, "")}
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

      {/* Category breakdown */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-foreground">分類統計</h2>
        <Card className="divide-y divide-border">
          {CATEGORIES.map((cat) => {
            const items = groupedByCategory[cat.id] || [];
            if (items.length === 0) return null;
            const total = items.reduce((a, b) => a + b.amount, 0);
            return (
              <div key={cat.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                    style={{ backgroundColor: cat.color + "15" }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{items.length} 筆</p>
                  </div>
                </div>
                <span
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: cat.type === "income" ? "#059669" : "#E11D48" }}
                >
                  {formatCurrency(total, currency)}
                </span>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Payment method breakdown */}
      {Object.keys(summary.byPayment).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-foreground">支付方式</h2>
          <Card className="divide-y divide-border">
            {Object.entries(summary.byPayment).map(([m, amount]) => {
              const pay = PAYMENT_METHODS[m as keyof typeof PAYMENT_METHODS];
              return (
                <div key={m} className="flex items-center justify-between p-4">
                  <span className="text-sm text-foreground">
                    {pay?.icon} {pay?.label || m}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{formatCurrency(amount, currency)}</span>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Market breakdown */}
      {Object.keys(summary.byMarket).length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3 text-foreground">市集營業額</h2>
          <Card className="divide-y divide-border">
            {Object.entries(summary.byMarket).map(([mid, amount]) => {
              const market = markets.find((m) => m.id === mid);
              return (
                <div key={mid} className="flex items-center justify-between p-4">
                  <span className="text-sm text-foreground">
                    {market ? `🏪 ${market.name}` : "🌐 未指定"}
                  </span>
                  <span className="text-sm font-semibold text-primary tabular-nums">
                    {formatCurrency(amount, currency)}
                  </span>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Today's transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">今日交易明細</h2>
          <Badge variant="secondary" className="text-xs">{todayTx.length} 筆</Badge>
        </div>
        {todayTx.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-3xl mb-2">📊</p>
            <p className="text-sm text-muted-foreground">今日尚無交易記錄</p>
          </Card>
        ) : (
          <Card className="divide-y divide-border">
            {todayTx.map((t) => {
              const cat = CATEGORIES.find((c) => c.id === t.category);
              return (
                <div key={t.id} className="flex items-center gap-3 p-3.5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: (cat?.color || "#6B7280") + "15" }}
                  >
                    {cat?.icon || "📝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{cat?.label || t.category}</p>
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
        )}
      </div>
    </div>
  );
}
