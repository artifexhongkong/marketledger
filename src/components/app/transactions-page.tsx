"use client";

import { useAppStore, getDailySummary, formatCurrency, formatDateTime, CATEGORIES, PAYMENT_METHODS, getPaymentMethodInfo } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Inbox } from "lucide-react";

export function TransactionsPage() {
  const { transactions, currency, currentMarketId, markets } = useAppStore();
  const summary = getDailySummary(transactions);
  const currentMarket = markets.find((m) => m.id === currentMarketId);

  // 今日全部交易，按時間倒序
  const todayTx = summary.todayTransactions.slice().sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="px-5 pb-4 space-y-5">
      {/* 標題區 */}
      <div className="pt-2">
        <p className="text-xs text-muted-foreground tracking-wide">
          {new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight mt-1 text-foreground">
          今日營業記錄
        </h1>
        {currentMarket && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-primary/8 text-primary px-2.5 py-1 rounded-full">
            📍 {currentMarket.name}
          </div>
        )}
      </div>

      {/* 摘要 Hero 卡 */}
      <Card className="bg-primary border-primary text-primary-foreground overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative p-5">
          <p className="text-xs text-primary-foreground/70 tracking-wider uppercase">今日淨利潤</p>
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
            <div className="w-px h-3 bg-primary-foreground/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-primary-foreground/70">交易</span>
              <span className="font-semibold tabular-nums">{summary.count} 筆</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 全部交易明細 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">全部交易</h2>
          <Badge variant="secondary" className="text-xs font-medium">{todayTx.length} 筆</Badge>
        </div>
        {todayTx.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">今日還沒有交易記錄</p>
            <p className="text-xs text-muted-foreground mt-1">前往「記帳」頁面開始記錄</p>
          </Card>
        ) : (
          <Card className="divide-y divide-border">
            {todayTx.map((t) => {
              const cat = CATEGORIES.find((c) => c.id === t.category);
              const pay = t.paymentMethod ? getPaymentMethodInfo(t.paymentMethod, useAppStore.getState().customPaymentMethods) : null;
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
        )}
      </div>
    </div>
  );
}
