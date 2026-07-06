"use client";

import { useState, useMemo } from "react";
import { useAppStore, formatCurrency, getCategoryInfo, getPaymentMethodInfo } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Calendar, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function DailyPage() {
  const { transactions, currency, customPaymentMethods } = useAppStore();
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const getDateSummary = (dateKey: string) => {
    const txs = groupedByDate[dateKey] || [];
    const income = txs.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = txs.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return { income, expense, profit: income - expense, count: txs.length };
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const days: any[] = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const summary = getDateSummary(dateKey);
      days.push({ day: d, dateKey, isToday: dateKey === todayKey, hasTransactions: summary.count > 0, profit: summary.profit, count: summary.count });
    }
    return days;
  }, [viewYear, viewMonth, groupedByDate]);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else { setViewMonth(viewMonth - 1); } setSelectedDate(null); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else { setViewMonth(viewMonth + 1); } setSelectedDate(null); };

  const monthSummary = useMemo(() => {
    const monthTxs = transactions.filter((t) => { const d = new Date(t.createdAt); return d.getFullYear() === viewYear && d.getMonth() === viewMonth; });
    const income = monthTxs.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = monthTxs.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return { income, expense, profit: income - expense, count: monthTxs.length };
  }, [transactions, viewYear, viewMonth]);

  const selectedTxs = selectedDate ? (groupedByDate[selectedDate] || []).sort((a, b) => b.createdAt - a.createdAt) : [];
  const selectedSummary = selectedDate ? getDateSummary(selectedDate) : null;

  const selectedDateLabel = selectedDate ? (() => {
    const d = new Date(selectedDate);
    const today = new Date(); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "今日";
    if (d.toDateString() === yesterday.toDateString()) return "昨日";
    return `${d.getMonth() + 1}/${d.getDate()}`;
  })() : null;

  return (
    <div className="px-4 pb-6 space-y-3">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-xl font-bold text-foreground">歷史記帳</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">點擊日曆查看每日記錄</p>
      </div>

      {/* 月份摘要 — 緊湊版 */}
      <div className="bg-gradient-to-br from-primary to-primary/85 rounded-2xl p-4 text-primary-foreground shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-primary-foreground/60 uppercase tracking-wider">{viewYear}年 {MONTHS[viewMonth]}</p>
            <p className="text-2xl font-bold tabular-nums mt-0.5">
              {monthSummary.profit >= 0 ? "+" : "−"}{formatCurrency(Math.abs(monthSummary.profit), currency)}
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 justify-end">
              <ArrowUpRight className="w-3 h-3 text-emerald-300" />
              <span className="text-[11px] text-primary-foreground/60">收入</span>
              <span className="text-xs font-semibold tabular-nums">{formatCurrency(monthSummary.income, currency)}</span>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <ArrowDownRight className="w-3 h-3 text-rose-300" />
              <span className="text-[11px] text-primary-foreground/60">支出</span>
              <span className="text-xs font-semibold tabular-nums">{formatCurrency(monthSummary.expense, currency)}</span>
            </div>
            <p className="text-[11px] text-primary-foreground/60">{monthSummary.count} 筆交易</p>
          </div>
        </div>
      </div>

      {/* 日曆 */}
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-sm font-bold text-foreground">{viewYear} {MONTHS[viewMonth]}</span>
          <button onClick={nextMonth} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-[9px] font-medium text-muted-foreground py-0.5">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const isSelected = selectedDate === day.dateKey;
            return (
              <button key={day.dateKey} onClick={() => setSelectedDate(isSelected ? null : day.dateKey)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all text-[11px]
                  ${isSelected ? "bg-primary text-primary-foreground shadow" : day.hasTransactions ? "bg-primary/8 text-foreground hover:bg-primary/15" : "text-muted-foreground hover:bg-muted"}
                  ${day.isToday && !isSelected ? "ring-1 ring-primary/40" : ""}`}>
                <span className={`font-medium ${day.isToday && !isSelected ? "text-primary" : ""}`}>{day.day}</span>
                {day.hasTransactions && (
                  <span className={`text-[8px] tabular-nums ${isSelected ? "text-primary-foreground/80" : day.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {day.profit >= 0 ? "+" : "−"}{Math.abs(day.profit) >= 1000 ? `${(Math.abs(day.profit) / 1000).toFixed(1)}k` : Math.abs(day.profit)}
                  </span>
                )}
                {day.hasTransactions && <div className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-primary-foreground" : "bg-primary"}`} />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 選中日期的交易 */}
      {selectedDate && selectedDateLabel && (
        <div>
          <div className="flex items-center justify-between px-1 mb-1.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground">{selectedDateLabel}</span>
              <span className="text-[10px] text-muted-foreground">{selectedSummary?.count || 0} 筆</span>
            </div>
            {selectedSummary && selectedSummary.count > 0 && (
              <span className={`text-xs font-bold tabular-nums ${selectedSummary.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                淨 {selectedSummary.profit >= 0 ? "+" : "−"}{formatCurrency(Math.abs(selectedSummary.profit), currency)}
              </span>
            )}
          </div>
          {selectedTxs.length === 0 ? (
            <Card className="p-4 text-center border-dashed">
              <Inbox className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
              <p className="text-[11px] text-muted-foreground">這天沒有交易</p>
            </Card>
          ) : (
            <Card className="divide-y divide-border overflow-hidden">
              {selectedTxs.map((t) => {
                const cat = getCategoryInfo(t.category);
                const pay = t.paymentMethod ? getPaymentMethodInfo(t.paymentMethod, customPaymentMethods) : null;
                return (
                  <div key={t.id} className="flex items-center gap-2.5 px-3 py-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: (cat?.color || "#6B7280") + "15" }}>
                      {cat?.icon || "📝"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-foreground truncate">{cat?.label || t.category}</p>
                        {pay && <span className="text-[9px] text-muted-foreground bg-muted px-1 rounded">{pay.label}</span>}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(t.createdAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}{t.note && ` · ${t.note}`}
                      </p>
                    </div>
                    <span className="text-sm font-bold tabular-nums flex-shrink-0"
                      style={{ color: t.type === "income" ? "#059669" : "#E11D48" }}>
                      {t.type === "income" ? "+" : "−"}{t.amount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      )}
      {!selectedDate && (
        <Card className="p-4 text-center border-dashed">
          <Calendar className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
          <p className="text-[11px] text-muted-foreground">點擊日曆任一日期查看記錄</p>
        </Card>
      )}
    </div>
  );
}
