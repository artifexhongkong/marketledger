"use client";

import { useState, useMemo } from "react";
import { useAppStore, formatCurrency, CATEGORIES, PAYMENT_METHODS } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Calendar, Inbox, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function DailyPage() {
  const { transactions, currency } = useAppStore();

  // 當前顯示的月份
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  // 選中的日期（null = 顯示該月全部）
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 按日期分組所有交易
  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    transactions.forEach((t) => {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
    return groups;
  }, [transactions]);

  // 取得某日期摘要
  const getDateSummary = (dateKey: string) => {
    const txs = groupedByDate[dateKey] || [];
    const income = txs.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return { income, expense, profit: income - expense, count: txs.length };
  };

  // 生成日曆天數
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const days: { day: number; dateKey: string; isToday: boolean; hasTransactions: boolean; profit: number; count: number }[] = [];

    // 前面空白
    for (let i = 0; i < startWeekday; i++) {
      days.push(null as any);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const summary = getDateSummary(dateKey);
      days.push({
        day: d,
        dateKey,
        isToday: dateKey === todayKey,
        hasTransactions: summary.count > 0,
        profit: summary.profit,
        count: summary.count,
      });
    }

    return days;
  }, [viewYear, viewMonth, groupedByDate]);

  // 月份切換
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
    setSelectedDate(null);
  };

  // 月份總計
  const monthSummary = useMemo(() => {
    const monthTxs = transactions.filter((t) => {
      const d = new Date(t.createdAt);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    });
    const income = monthTxs.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = monthTxs.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return { income, expense, profit: income - expense, count: monthTxs.length };
  }, [transactions, viewYear, viewMonth]);

  // 選中日期的交易
  const selectedTxs = selectedDate
    ? (groupedByDate[selectedDate] || []).sort((a, b) => b.createdAt - a.createdAt)
    : [];

  const selectedSummary = selectedDate ? getDateSummary(selectedDate) : null;

  // 格式化選中日期標題
  const selectedDateLabel = selectedDate
    ? (() => {
        const d = new Date(selectedDate);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (d.toDateString() === today.toDateString()) return "今日";
        if (d.toDateString() === yesterday.toDateString()) return "昨日";
        return `${d.getMonth() + 1}月${d.getDate()}日`;
      })()
    : null;

  return (
    <div className="px-5 pb-4 space-y-4">
      {/* 標題 */}
      <div className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">歷史記帳</h1>
        <p className="text-xs text-muted-foreground mt-1">點擊日曆查看每日記錄</p>
      </div>

      {/* 月份摘要 */}
      <Card className="bg-primary border-primary text-primary-foreground overflow-hidden relative shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative p-4">
          <p className="text-xs text-primary-foreground/70 tracking-wider uppercase">
            {viewYear}年 {MONTHS[viewMonth]} 總計
          </p>
          <p className="text-3xl font-bold tracking-tight mt-1 tabular-nums">
            {monthSummary.profit >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(monthSummary.profit), currency)}
          </p>
          <div className="flex items-center gap-3 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <ArrowUpRight className="w-3 h-3 text-emerald-300" />
              <span className="text-primary-foreground/70">收入</span>
              <span className="font-semibold tabular-nums">{formatCurrency(monthSummary.income, currency)}</span>
            </div>
            <div className="w-px h-3 bg-primary-foreground/20" />
            <div className="flex items-center gap-1.5">
              <ArrowDownRight className="w-3 h-3 text-rose-300" />
              <span className="text-primary-foreground/70">支出</span>
              <span className="font-semibold tabular-nums">{formatCurrency(monthSummary.expense, currency)}</span>
            </div>
            <div className="w-px h-3 bg-primary-foreground/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-primary-foreground/70">交易</span>
              <span className="font-semibold tabular-nums">{monthSummary.count}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 日曆 */}
      <Card className="p-4">
        {/* 月份切換 */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-sm font-semibold text-foreground">
            {viewYear}年 {MONTHS[viewMonth]}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* 星期標題 */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-[10px] font-medium text-muted-foreground py-1">
              {w}
            </div>
          ))}
        </div>

        {/* 日曆天數 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} />;
            }
            const isSelected = selectedDate === day.dateKey;
            return (
              <button
                key={day.dateKey}
                onClick={() => setSelectedDate(isSelected ? null : day.dateKey)}
                className={`
                  relative aspect-square rounded-lg flex flex-col items-center justify-center
                  transition-all text-xs
                  ${isSelected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : day.hasTransactions
                    ? "bg-primary/8 text-foreground hover:bg-primary/15"
                    : "text-muted-foreground hover:bg-muted"
                  }
                  ${day.isToday && !isSelected ? "ring-1 ring-primary/40" : ""}
                `}
              >
                <span className={`font-medium ${day.isToday && !isSelected ? "text-primary" : ""}`}>
                  {day.day}
                </span>
                {day.hasTransactions && (
                  <span className={`text-[9px] tabular-nums mt-0.5 ${
                    isSelected ? "text-primary-foreground/80" : day.profit >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}>
                    {day.profit >= 0 ? "+" : "−"}
                    {day.profit >= 1000 ? `${(day.profit / 1000).toFixed(1)}k` : Math.abs(day.profit)}
                  </span>
                )}
                {day.hasTransactions && (
                  <div className={`absolute bottom-1 w-1 h-1 rounded-full ${
                    isSelected ? "bg-primary-foreground" : "bg-primary"
                  }`} />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 選中日期的交易記錄 */}
      {selectedDate && selectedDateLabel && (
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">{selectedDateLabel}</span>
              <span className="text-[10px] text-muted-foreground">
                {selectedSummary?.count || 0} 筆交易
              </span>
            </div>
            {selectedSummary && selectedSummary.count > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-emerald-600">
                  <TrendingUp className="w-3 h-3" />
                  {formatCurrency(selectedSummary.income, currency)}
                </span>
                <span className="flex items-center gap-1 text-rose-600">
                  <TrendingDown className="w-3 h-3" />
                  {formatCurrency(selectedSummary.expense, currency)}
                </span>
                <span className={`font-semibold tabular-nums ${selectedSummary.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  淨{selectedSummary.profit >= 0 ? "+" : "−"}{formatCurrency(Math.abs(selectedSummary.profit), currency)}
                </span>
              </div>
            )}
          </div>

          {selectedTxs.length === 0 ? (
            <Card className="p-6 text-center border-dashed">
              <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">這天沒有交易記錄</p>
            </Card>
          ) : (
            <Card className="divide-y divide-border">
              {selectedTxs.map((t) => {
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
          )}
        </div>
      )}

      {/* 未選中日期時的提示 */}
      {!selectedDate && (
        <Card className="p-6 text-center border-dashed">
          <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">點擊上方日曆任一日期查看當天記錄</p>
        </Card>
      )}
    </div>
  );
}
