"use client";

import { useState } from "react";
import { useAppStore, formatCurrency, formatDateTime, CATEGORIES, PAYMENT_METHODS } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Calendar, Inbox } from "lucide-react";

export function DailyPage() {
  const { transactions, currency } = useAppStore();
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  // 按日期分組（所有歷史記錄）
  const groupedByDate: Record<string, typeof transactions> = {};
  const filtered = transactions.filter((t) => {
    if (filter === "income") return t.type === "income";
    if (filter === "expense") return t.type === "expense";
    return true;
  });

  filtered.forEach((t) => {
    const d = new Date(t.createdAt);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(t);
  });

  // 按日期倒序
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  // 計算每個日期的摘要
  const getDateSummary = (txs: typeof transactions) => {
    const income = txs.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return { income, expense, profit: income - expense, count: txs.length };
  };

  // 總計
  const totalIncome = filtered.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const totalProfit = totalIncome - totalExpense;

  return (
    <div className="px-5 pb-4 space-y-4">
      {/* 標題 */}
      <div className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">歷史記帳</h1>
        <p className="text-xs text-muted-foreground mt-1">所有歷史交易記錄</p>
      </div>

      {/* 總計摘要 */}
      <Card className="bg-primary border-primary text-primary-foreground overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative p-4">
          <p className="text-xs text-primary-foreground/70 tracking-wider uppercase">累計淨利潤</p>
          <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums">
            {totalProfit >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(totalProfit), currency)}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="w-3 h-3 text-emerald-300" />
              <span className="text-primary-foreground/70">收入</span>
              <span className="font-semibold tabular-nums">{formatCurrency(totalIncome, currency)}</span>
            </div>
            <div className="w-px h-3 bg-primary-foreground/20" />
            <div className="flex items-center gap-1.5">
              <ArrowDownRight className="w-3 h-3 text-rose-300" />
              <span className="text-primary-foreground/70">支出</span>
              <span className="font-semibold tabular-nums">{formatCurrency(totalExpense, currency)}</span>
            </div>
            <div className="w-px h-3 bg-primary-foreground/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-primary-foreground/70">交易</span>
              <span className="font-semibold tabular-nums">{filtered.length}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 篩選 */}
      <div className="flex gap-2">
        {([
          { k: "all", l: "全部" },
          { k: "income", l: "收入" },
          { k: "expense", l: "支出" },
        ] as const).map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
              filter === f.k
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground"
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>

      {/* 按日期分組的歷史記錄 */}
      {sortedDates.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">尚無歷史記錄</p>
          <p className="text-xs text-muted-foreground mt-1">開始記帳後這裡會顯示所有歷史交易</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateKey) => {
            const dayTxs = groupedByDate[dateKey].sort((a, b) => b.createdAt - a.createdAt);
            const summary = getDateSummary(dayTxs);
            const d = new Date(dateKey);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const isToday = d.toDateString() === today.toDateString();
            const isYesterday = d.toDateString() === yesterday.toDateString();
            const dateLabel = isToday
              ? "今日"
              : isYesterday
              ? "昨日"
              : `${d.getMonth() + 1}月${d.getDate()}日`;
            const weekday = ["日", "一", "二", "三", "四", "五", "六"][d.getDay()];

            return (
              <div key={dateKey}>
                {/* 日期標題 */}
                <div className="flex items-center justify-between px-1 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{dateLabel}</span>
                    {!isToday && !isYesterday && (
                      <span className="text-[10px] text-muted-foreground">週{weekday}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{summary.count} 筆</span>
                    <span className={`font-semibold tabular-nums ${summary.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {summary.profit >= 0 ? "+" : "−"}
                      {formatCurrency(Math.abs(summary.profit), currency)}
                    </span>
                  </div>
                </div>

                {/* 該日交易清單 */}
                <Card className="divide-y divide-border">
                  {dayTxs.map((t) => {
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
                            {new Date(t.createdAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
