"use client";

import { useState, useMemo } from "react";
import { useAppStore, formatCurrency, getCategoryInfo, CATEGORIES } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { useT } from "@/lib/i18n";
import { TrendingUp, TrendingDown, ShoppingBag, Wallet } from "lucide-react";

type Period = "week" | "month";

export function StatsPage() {
  const t = useT();
  const { transactions, currency } = useAppStore();
  const [period, setPeriod] = useState<Period>("week");

  const stats = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    if (period === "week") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const periodTx = transactions.filter((t) => new Date(t.createdAt) >= startDate);

    const income = periodTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = periodTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    const profit = income - expense;
    const txCount = periodTx.length;

    // 訂單數（同組交易算一單）
    const incomeTx = periodTx.filter((t) => t.type === "income");
    let orderCount = 0;
    let lastTime = 0;
    incomeTx.sort((a, b) => a.createdAt - b.createdAt).forEach((t) => {
      if (t.createdAt - lastTime > 60000) orderCount++;
      lastTime = t.createdAt;
    });
    const avgOrder = orderCount > 0 ? Math.round(income / orderCount) : 0;

    // 按t.stats_category_stats
    const byCategory: Record<string, { income: number; expense: number; count: number }> = {};
    periodTx.forEach((t) => {
      if (!byCategory[t.category]) byCategory[t.category] = { income: 0, expense: 0, count: 0 };
      if (t.type === "income") byCategory[t.category].income += t.amount;
      else byCategory[t.category].expense += t.amount;
      byCategory[t.category].count++;
    });

    // 按日統計（近 7 天或近 30 天）
    const days = period === "week" ? 7 : 30;
    const dailyData: { date: string; profit: number; income: number; expense: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayKey = `${d.getMonth() + 1}/${d.getDate()}`;
      const dayTx = periodTx.filter((t) => {
        const td = new Date(t.createdAt);
        return td.toDateString() === d.toDateString();
      });
      const dayIncome = dayTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
      const dayExpense = dayTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
      dailyData.push({ date: dayKey, profit: dayIncome - dayExpense, income: dayIncome, expense: dayExpense });
    }

    return { income, expense, profit, txCount, orderCount, avgOrder, byCategory, dailyData };
  }, [transactions, period]);

  // 找最大值用於條形圖比例
  const maxProfit = Math.max(...stats.dailyData.map((d) => Math.abs(d.profit)), 1);

  // 分類佔比（按金額排序）
  const categoryList = Object.entries(stats.byCategory)
    .map(([catId, data]) => ({
      cat: getCategoryInfo(catId),
      ...data,
      total: data.income + data.expense,
    }))
    .sort((a, b) => b.total - a.total);

  const maxCategoryTotal = Math.max(...categoryList.map((c) => c.total), 1);

  return (
    <div className="px-4 pb-4 space-y-3">
      {/* 標題 */}
      <div className="pt-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{t.stats_title}</h1>
      </div>

      {/* 期間切換 */}
      <div className="flex bg-muted rounded-lg p-0.5">
        <button
          onClick={() => setPeriod("week")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${period === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          t.stats_this_week
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition ${period === "month" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
        >
          t.stats_this_month
        </button>
      </div>

      {/* 摘要卡片 */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[10px] text-muted-foreground">{t.stats_income}</p>
          </div>
          <p className="text-lg font-bold tabular-nums text-emerald-600">{formatCurrency(stats.income, currency)}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <p className="text-[10px] text-muted-foreground">{t.stats_expense}</p>
          </div>
          <p className="text-lg font-bold tabular-nums text-rose-600">{formatCurrency(stats.expense, currency)}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Wallet className="w-3.5 h-3.5 text-primary" />
            <p className="text-[10px] text-muted-foreground">{t.stats_net_profit}</p>
          </div>
          <p className={`text-lg font-bold tabular-nums ${stats.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {stats.profit >= 0 ? "+" : "−"}{formatCurrency(Math.abs(stats.profit), currency)}
          </p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-accent" />
            <p className="text-[10px] text-muted-foreground">{t.stats_avg_order}</p>
          </div>
          <p className="text-lg font-bold tabular-nums text-foreground">
            {stats.orderCount > 0 ? formatCurrency(stats.avgOrder, currency) : "—"}
          </p>
          <p className="text-[9px] text-muted-foreground">{stats.orderCount} 單 · {stats.txCount} 筆</p>
        </Card>
      </div>

      {/* 每日趨勢圖（簡易條形圖） */}
      <Card className="p-3">
        <p className="text-xs font-semibold text-foreground mb-2">每日t.stats_net_profit趨勢</p>
        <div className="flex items-end gap-0.5 h-24">
          {stats.dailyData.map((d, i) => {
            const heightPct = Math.abs(d.profit) / maxProfit * 100;
            const isPositive = d.profit >= 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                {/* tooltip */}
                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition bg-foreground text-background text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none z-10">
                  {d.date}: {isPositive ? "+" : "−"}{formatCurrency(Math.abs(d.profit), currency)}
                </div>
                <div
                  className={`w-full rounded-t transition-all ${
                    d.profit === 0 ? "bg-muted" : isPositive ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                  style={{ height: `${d.profit === 0 ? 2 : Math.max(heightPct, 3)}%` }}
                />
                {/* 日期標籤 — 只顯示部分避免擁擠 */}
                {stats.dailyData.length <= 7 && (
                  <span className="text-[7px] text-muted-foreground mt-0.5">{d.date}</span>
                )}
                {stats.dailyData.length > 7 && i % 5 === 0 && (
                  <span className="text-[7px] text-muted-foreground mt-0.5">{d.date}</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 分類佔比 */}
      <Card className="p-3">
        <p className="text-xs font-semibold text-foreground mb-2">{t.stats_category_stats}</p>
        {categoryList.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">{t.stats_no_data}</p>
        ) : (
          <div className="space-y-2">
            {categoryList.map(({ cat, income, expense, count, total }) => (
              <div key={cat?.id}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{cat?.icon}</span>
                    <span className="text-[11px] font-medium text-foreground">{cat?.label}</span>
                    <span className="text-[9px] text-muted-foreground">{count} 筆</span>
                  </div>
                  <span
                    className="text-[11px] font-bold tabular-nums"
                    style={{ color: income > expense ? "#059669" : "#E11D48" }}
                  >
                    {income > 0 && `+${formatCurrency(income, currency)}`}
                    {expense > 0 && ` −${formatCurrency(expense, currency)}`}
                  </span>
                </div>
                {/* 條形圖 */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(total / maxCategoryTotal) * 100}%`,
                      backgroundColor: cat?.color || "#6B7280",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
