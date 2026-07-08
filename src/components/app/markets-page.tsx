"use client";

import { useState, useMemo, useEffect } from "react";
import { useAppStore, formatCurrency, CURRENCIES, type MarketEvent, getCategoryInfo, getPaymentMethodInfo } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { groupTransactions } from "@/lib/tx-group";
import { TxGroupCard } from "@/components/app/transactions-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, MapPin, Calendar, Clock, Store, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff, Pencil, Inbox, ArrowUpRight, ArrowDownRight, User } from "lucide-react";
import { useT } from "@/lib/i18n";

const EVENT_COLORS = ["#1A1D24", "#059669", "#E11D48", "#F59E0B", "#7C3AED", "#0891B2"];
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function MarketsPage() {
  const t = useT();
  const { marketEvents, addMarketEvent, deleteMarketEvent, updateMarketEvent, currency, transactions, customPaymentMethods, stickyNotes, addStickyNote, updateStickyNote, deleteStickyNote } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MarketEvent | null>(null);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [showProfit, setShowProfit] = useState(true);
  // 選中的日期（點擊日曆某天 → 顯示該天交易列表）
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // 日期記錄展開的訂單組
  const [expandedTxGroup, setExpandedTxGroup] = useState<string | null>(null);
  // 年月選擇抽屜狀態："none" | "opening" | "open" | "closing" | "returning"
  const [drawerState, setDrawerState] = useState<"none" | "open" | "closing" | "returning">("none");
  // 年份切換 — 3D Barrel Roll 觸發 key（改變就重播動畫）
  const [barrelKey, setBarrelKey] = useState(0);
  // 點擊的月份/日期 cell（觸發凹陷動畫）
  const [pressedCell, setPressedCell] = useState<string | null>(null);
  const [pickerYear, setPickerYear] = useState(viewYear); // 抽屜中的年份（可獨立切換）

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); setSelectedDate(null); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); setSelectedDate(null); };

  // 按日期分組交易
  const groupedByDate = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    transactions.forEach((t) => {
      const key = toDateKey(new Date(t.createdAt));
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

  // 月份總計（給 Hero 卡用）
  const monthSummary = useMemo(() => {
    const monthTxs = transactions.filter((t) => {
      const d = new Date(t.createdAt);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    });
    const income = monthTxs.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = monthTxs.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return { income, expense, profit: income - expense, count: monthTxs.length };
  }, [transactions, viewYear, viewMonth]);

  const monthEvents = useMemo(() => marketEvents.filter((e) => {
    const start = parseDateKey(e.startDate); const end = parseDateKey(e.endDate);
    const ms = new Date(viewYear, viewMonth, 1); const me = new Date(viewYear, viewMonth + 1, 0);
    return start <= me && end >= ms;
  }), [marketEvents, viewYear, viewMonth]);

  const upcomingEvents = useMemo(() => {
    const today = toDateKey(new Date());
    return marketEvents.filter((e) => e.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [marketEvents]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startWd = firstDay.getDay(); const daysInMonth = lastDay.getDate();
    const todayKey = toDateKey(new Date());
    const days: any[] = [];
    for (let i = 0; i < startWd; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = toDateKey(new Date(viewYear, viewMonth, d));
      const dayEvents = marketEvents.filter((e) => dateKey >= e.startDate && dateKey <= e.endDate);
      const summary = getDateSummary(dateKey);
      days.push({ day: d, dateKey, isToday: dateKey === todayKey, events: dayEvents, profit: summary.profit, count: summary.count, hasTx: summary.count > 0 });
    }
    return days;
  }, [viewYear, viewMonth, marketEvents, groupedByDate]);

  const handleSave = (data: Omit<MarketEvent, "id" | "createdAt">) => {
    if (editingEvent) {
      updateMarketEvent(editingEvent.id, data);
      const { transactions: txs } = useAppStore.getState();
      const cleaned = txs.filter((t) => t.marketId !== editingEvent.id);
      useAppStore.setState({ transactions: cleaned });
      if (data.autoAddFee && data.boothFee > 0) {
        reAddFees(editingEvent.id, data);
      }
    } else {
      addMarketEvent(data);
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  const reAddFees = (eventId: string, e: Omit<MarketEvent, "id" | "createdAt">) => {
    const { currency, transactions: txs } = useAppStore.getState();
    const start = parseDateKey(e.startDate); const end = parseDateKey(e.endDate);
    const dayMs = 86400000;
    const totalDays = Math.round((end.getTime() - start.getTime()) / dayMs) + 1;
    // 總計模式：平均分攤，尾差給最後一天
    const baseDailyAmount = e.feeType === "total" ? Math.floor(e.boothFee / totalDays) : e.boothFee;
    const remainder = e.feeType === "total" ? e.boothFee - baseDailyAmount * totalDays : 0;
    const newTxs: any[] = [];
    const daysToAdd: { ts: number; amount: number }[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayTs = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0).getTime();
      daysToAdd.push({ ts: dayTs, amount: baseDailyAmount });
    }
    // 尾差加到最後一天
    if (e.feeType === "total" && remainder > 0 && daysToAdd.length > 0) {
      daysToAdd[daysToAdd.length - 1].amount += remainder;
    }
    for (const day of daysToAdd) {
      newTxs.push({
        id: `tx_mkt_${day.ts}_${Math.random().toString(36).slice(2, 6)}`,
        type: "expense", amount: day.amount, currency, category: "rent",
        paymentMethod: "cash", note: `${e.name} 攤位費`, marketId: eventId, createdAt: day.ts,
      });
    }
    if (newTxs.length > 0) useAppStore.setState({ transactions: [...useAppStore.getState().transactions, ...newTxs] });
  };

  const handleEdit = (event: MarketEvent) => { setEditingEvent(event); setShowForm(true); };
  const handleDelete = (id: string) => { deleteMarketEvent(id); };
  const handleAdd = () => { setEditingEvent(null); setShowForm(true); };

  // 選中日期的交易列表
  const selectedTxs = selectedDate ? (groupedByDate[selectedDate] || []).slice().sort((a, b) => b.createdAt - a.createdAt) : [];
  const selectedSummary = selectedDate ? getDateSummary(selectedDate) : null;
  const selectedDateLabel = selectedDate ? (() => {
    const d = parseDateKey(selectedDate);
    const today = new Date(); const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "今日";
    if (d.toDateString() === yesterday.toDateString()) return "昨日";
    return `${d.getMonth() + 1}/${d.getDate()}`;
  })() : null;

  return (
    <div className="px-4 pb-6 space-y-3">
      {/* Header */}
      <div className="pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">t.markets_title</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">t.markets_subtitle</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowProfit(!showProfit)}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition ${showProfit ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
            {showProfit ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={handleAdd}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-medium hover:bg-accent/20 transition">
            <Plus className="w-3.5 h-3.5" />新增
          </button>
        </div>
      </div>

      {/* 月份總計 Hero（取代舊的簡陋「月盈虧」一行字）*/}
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

      {/* 日曆 — 同時顯示每日盈虧 + 市集活動彩色點 + 點擊選取日期 */}
      <Card className="p-3 relative overflow-visible">
        {/* Header — 點年份月份拉開抽屜 */}
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted"><ChevronLeft className="w-4 h-4 text-foreground" /></button>
          <button
            onClick={() => {
              if (drawerState === "none" || drawerState === "returning") {
                setPickerYear(viewYear);
                setDrawerState("open");
              } else {
                // 正在開啟中 → 關閉
                setDrawerState("closing");
                setTimeout(() => setDrawerState("none"), 350);
              }
            }}
            className={`text-[11px] font-semibold text-foreground px-2 py-0.5 rounded hover:bg-muted transition ${drawerState === "open" ? "bg-muted" : ""}`}
          >
            {viewYear}年 {MONTHS[viewMonth]}
          </button>
          <button onClick={nextMonth} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted"><ChevronRight className="w-4 h-4 text-foreground" /></button>
        </div>

        {/* 日期網格（drawerState === "none" 或 "returning" 時顯示） */}
        {(drawerState === "none" || drawerState === "returning") && (
          <div className={drawerState === "returning" ? "animate-date-bounce-drop" : ""}>
            <div className="grid grid-cols-7 gap-0.5 mb-1">{WEEKDAYS.map((w) => <div key={w} className="text-center text-[9px] font-medium text-muted-foreground py-0.5">{w}</div>)}</div>
            <div className="grid grid-cols-7 gap-0.5">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const isSelected = selectedDate === day.dateKey;
                const cellKey = `day-${day.dateKey}`;
                const isPressed = pressedCell === cellKey;
                return (
                  <button
                    key={day.dateKey}
                    onClick={() => {
                      // 觸發凹陷動畫
                      setPressedCell(cellKey);
                      setTimeout(() => setPressedCell(null), 200);
                      setSelectedDate(isSelected ? null : day.dateKey);
                    }}
                    className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] transition-all border ${isPressed ? "animate-cell-press" : ""}
                      ${isSelected ? "bg-accent text-accent-foreground border-accent shadow" : "border-transparent"}
                      ${!isSelected && day.events.length > 0 ? "bg-muted/40" : ""}
                      ${!isSelected && day.hasTx && day.events.length === 0 ? "bg-primary/5" : ""}
                      ${!isSelected ? "hover:bg-muted" : ""}
                      ${day.isToday && !isSelected ? "ring-1 ring-accent/40" : ""}`}
                  >
                    <span className={`font-medium leading-none ${isSelected ? "text-accent-foreground" : day.isToday ? "text-accent" : "text-foreground"}`}>{day.day}</span>
                    {showProfit && day.hasTx && (
                      <span className={`text-[8px] tabular-nums mt-0.5 leading-none ${isSelected ? "text-accent-foreground/80" : day.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {day.profit >= 0 ? "+" : "−"}{Math.abs(day.profit) >= 1000 ? `${(Math.abs(day.profit) / 1000).toFixed(1)}k` : Math.abs(day.profit)}
                      </span>
                    )}
                    {day.events.length > 0 && (
                      <div className="absolute bottom-0.5 flex gap-0.5">
                        {day.events.slice(0, 3).map((e: MarketEvent, ei: number) => (
                          <div key={ei} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.85)" : e.color }} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 年月選擇抽屜 — 從頂部向下滑出（拉開布簾效果） */}
        {drawerState === "open" && (
          <div
            className="absolute left-0 right-0 top-full z-20 animate-drawer-down"
            style={{
              maxHeight: "33vh",
              overflowY: "auto",
            }}
          >
            <div className="bg-card/95 backdrop-blur-md border border-border/60 rounded-b-2xl shadow-xl p-3 mx-1">
              {/* 年份切換 — 3D Barrel Roll */}
              <div className="flex items-center justify-between mb-2" style={{ perspective: "400px" }}>
                <button
                  onClick={() => {
                    setPickerYear(pickerYear - 1);
                    setBarrelKey((k) => k + 1);
                  }}
                  className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted active:scale-90 transition"
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <span
                  key={`${pickerYear}-${barrelKey}`}
                  className="text-sm font-bold text-foreground animate-barrel-roll"
                  style={{ transformStyle: "preserve-3d", transformOrigin: "center" }}
                >
                  {pickerYear}年
                </span>
                <button
                  onClick={() => {
                    setPickerYear(pickerYear + 1);
                    setBarrelKey((k) => k + 1);
                  }}
                  className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted active:scale-90 transition"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </div>

              {/* 3x4 月份網格 — 緊湊佈局 */}
              <div className="grid grid-cols-4 gap-1">
                {MONTHS.map((m, i) => {
                  const isCurrent = i === viewMonth && pickerYear === viewYear;
                  const cellKey = `month-${i}`;
                  const isPressed = pressedCell === cellKey;
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        // 觸發凹陷動畫
                        setPressedCell(cellKey);
                        // 等 150ms 凹陷動畫完成後關閉抽屜
                        setTimeout(() => {
                          setViewYear(pickerYear);
                          setViewMonth(i);
                          setSelectedDate(null);
                          setPressedCell(null);
                          // 開始關閉抽屜（Spring 收回）
                          setDrawerState("closing");
                          // 等 350ms 收回動畫完成後切到 returning
                          setTimeout(() => {
                            setDrawerState("returning");
                            // 等 350ms bounce-drop 完成後回到 none
                            setTimeout(() => setDrawerState("none"), 350);
                          }, 350);
                        }, 150);
                      }}
                      className={`py-2 rounded-md text-xs font-medium transition-all ${isPressed ? "animate-cell-press" : ""} ${
                        isCurrent ? "bg-accent text-accent-foreground shadow-sm" : "bg-muted/40 text-foreground hover:bg-muted active:scale-95"
                      }`}
                      style={{
                        animation: `monthCellFadeIn 0.25s cubic-bezier(0.25, 1, 0.5, 1) ${i * 0.03}s both`,
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* 點擊抽屜外區域關閉 */}
            <div
              className="fixed inset-0 -z-10"
              onClick={() => {
                setDrawerState("closing");
                setTimeout(() => setDrawerState("none"), 350);
              }}
            />
          </div>
        )}

        {/* 抽屜關閉中動畫 */}
        {drawerState === "closing" && (
          <div
            className="absolute left-0 right-0 top-full z-20 animate-drawer-up"
            style={{ maxHeight: "33vh" }}
          >
            <div className="bg-card/95 backdrop-blur-md border border-border/60 rounded-b-2xl shadow-xl p-3 mx-1">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7" />
                <span className="text-sm font-bold text-foreground">{pickerYear}年</span>
                <div className="w-7 h-7" />
              </div>
              <div className="grid grid-cols-4 gap-1">
                {MONTHS.map((m) => (
                  <div key={m} className="py-2 rounded-md text-xs font-medium bg-muted/40 text-foreground text-center">{m}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 選中日期的交易列表 */}
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
                {selectedSummary.profit >= 0 ? "+" : "−"}{formatCurrency(Math.abs(selectedSummary.profit), currency)}
              </span>
            )}
          </div>
          {selectedTxs.length === 0 ? (
            <Card className="p-4 text-center border-dashed">
              <Inbox className="w-6 h-6 text-muted-foreground/40 mx-auto mb-1" />
              <p className="text-[11px] text-muted-foreground">這天沒有交易</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {groupTransactions(selectedTxs).map((group) => (
                <TxGroupCard
                  key={group.id}
                  group={group}
                  currency={currency}
                  compact
                  isExpanded={expandedTxGroup === group.id}
                  onToggle={() => setExpandedTxGroup(expandedTxGroup === group.id ? null : group.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* t.markets_upcoming市集 */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">t.markets_upcoming</p>
          {upcomingEvents.slice(0, 3).map((e) => (
            <EventCard key={e.id} event={e} currency={currency} onEdit={() => handleEdit(e)} onDelete={() => handleDelete(e.id)} />
          ))}
        </div>
      )}

      {/* 當月市集活動 */}
      {monthEvents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">{MONTHS[viewMonth]}市集（{monthEvents.length}）</p>
          {monthEvents.map((e) => <EventCard key={e.id} event={e} currency={currency} onEdit={() => handleEdit(e)} onDelete={() => handleDelete(e.id)} />)}
        </div>
      )}

      {/* t.markets_sticky_notes區 */}
      <StickyNotesSection
        notes={stickyNotes}
        onAdd={addStickyNote}
        onUpdate={updateStickyNote}
        onDelete={deleteStickyNote}
      />

      {showForm && <EventFormModal onClose={() => { setShowForm(false); setEditingEvent(null); }} onSave={handleSave} currency={currency} editingEvent={editingEvent} />}
    </div>
  );
}

function EventCard({ event, currency, onEdit, onDelete }: { event: MarketEvent; currency: string; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const days = Math.ceil((parseDateKey(event.endDate).getTime() - parseDateKey(event.startDate).getTime()) / 86400000) + 1;
  const dailyFee = event.feeType === "daily" ? event.boothFee : Math.round(event.boothFee / days);
  const totalFee = event.feeType === "daily" ? event.boothFee * days : event.boothFee;
  return (
    <Card className="overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      <div className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-2">
          <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: event.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{event.name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{event.startDate === event.endDate ? event.startDate : `${event.startDate.slice(5)} ~ ${event.endDate.slice(5)}`}</span>
              {event.location && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{event.location}</span>}
            </div>
            {event.boothFee > 0 && <p className="text-[10px] text-muted-foreground mt-0.5">攤位費 {formatCurrency(dailyFee, currency as any)}{event.feeType === "daily" ? "/天" : ""}<span className="text-muted-foreground/60"> · 共 {formatCurrency(totalFee, currency as any)}</span></p>}
          </div>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`} />
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border space-y-1.5 animate-[fadeIn_0.15s_ease-out]">
          {event.boothNumber && <InfoRow icon={<Store className="w-3 h-3" />} label="t.markets_booth_number" value={event.boothNumber} />}
          {event.businessHours && <InfoRow icon={<Clock className="w-3 h-3" />} label="t.markets_business_hours" value={event.businessHours} />}
          {event.notes && <InfoRow icon={<Calendar className="w-3 h-3" />} label="t.markets_notes" value={event.notes} />}
          {event.autoAddFee && <p className="text-[10px] text-emerald-600">✓ 已t.markets_auto_fee</p>}
          <div className="flex gap-2 mt-2">
            <button onClick={onEdit} className="flex items-center gap-1 text-[11px] text-accent hover:text-foreground px-2 py-1 rounded-md hover:bg-accent/10"><Pencil className="w-3 h-3" />編輯</button>
            <button onClick={onDelete} className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 px-2 py-1 rounded-md hover:bg-rose-50"><Trash2 className="w-3 h-3" />刪除</button>
          </div>
        </div>
      )}
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-1.5 text-[11px]"><span className="text-muted-foreground">{icon}</span><span className="text-muted-foreground">{label}：</span><span className="text-foreground">{value}</span></div>;
}

// ── Agoda 風格日曆日期選擇器 ──
function AgodaDatePicker({ startDate, endDate, onSelect }: { startDate: string; endDate: string; onSelect: (start: string, end: string) => void }) {
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [selecting, setSelecting] = useState<"start" | "end">("start");
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  const days = useMemo(() => {
    const first = new Date(calYear, calMonth, 1);
    const last = new Date(calYear, calMonth + 1, 0);
    const startWd = first.getDay(); const dim = last.getDate();
    const todayKey = toDateKey(new Date());
    const arr: any[] = [];
    for (let i = 0; i < startWd; i++) arr.push(null);
    for (let d = 1; d <= dim; d++) {
      const key = toDateKey(new Date(calYear, calMonth, d));
      arr.push({ day: d, key, isToday: key === todayKey, isStart: key === tempStart, isEnd: key === tempEnd, inRange: tempStart && tempEnd && key > tempStart && key < tempEnd, isPast: key < todayKey });
    }
    return arr;
  }, [calYear, calMonth, tempStart, tempEnd]);

  const handleDayClick = (key: string) => {
    // 狀態機（用 selecting + 是否已有範圍判斷）
    const hasRange = tempStart !== "" && tempEnd !== "" && tempEnd !== tempStart;
    let newStart = tempStart;
    let newEnd = tempEnd;

    if (selecting === "end") {
      if (key < tempStart) {
        newStart = key; newEnd = key;
        setTempStart(key); setTempEnd(key);
      } else {
        newEnd = key;
        setTempEnd(key); setSelecting("start");
      }
    } else {
      // selecting === "start"
      if (hasRange && (key === tempStart || key === tempEnd)) {
        // 已選好一輪，點到邊界 → 清除
        newStart = ""; newEnd = "";
        setTempStart(""); setTempEnd("");
      } else {
        // 初次或重設
        newStart = key; newEnd = key;
        setTempStart(key); setTempEnd(key); setSelecting("end");
      }
    }
    // 用新值通知父元件（不能用 tempStart/tempEnd，因為 setState 還沒生效）
    onSelect(newStart, newEnd);
  };

  const prev = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); };
  const next = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button type="button" onClick={prev} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-sm font-bold">{calYear} {MONTHS[calMonth]}</span>
        <button type="button" onClick={next} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">{WEEKDAYS.map((w) => <div key={w} className="text-center text-[9px] font-medium text-muted-foreground py-0.5">{w}</div>)}</div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          return (
            <button type="button" key={d.key} onClick={() => !d.isPast && handleDayClick(d.key)} disabled={d.isPast}
              className={`relative aspect-square rounded-lg flex items-center justify-center text-[11px] transition
                ${d.isStart || d.isEnd ? "bg-accent text-white font-bold" : ""}
                ${d.inRange ? "bg-accent/15 text-foreground" : ""}
                ${!d.isStart && !d.isEnd && !d.inRange && !d.isPast ? "text-foreground hover:bg-muted" : ""}
                ${d.isPast ? "text-muted-foreground/30 cursor-not-allowed" : ""}
                ${d.isToday && !d.isStart && !d.isEnd ? "ring-1 ring-accent/40" : ""}`}>
              {d.day}
              {d.isStart && <span className="absolute -bottom-3 text-[7px] text-accent">開始</span>}
              {d.isEnd && d.isEnd !== d.isStart && <span className="absolute -bottom-3 text-[7px] text-accent">結束</span>}
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 px-1">
        <span className="text-[10px] text-muted-foreground">
          {!tempStart ? "點選市集開始日" : tempStart === tempEnd ? "再點一次取消，或點結束日" : `${tempStart} ~ ${tempEnd}`}
        </span>
        <button type="button" onClick={() => { setTempStart(toDateKey(new Date())); setTempEnd(toDateKey(new Date())); setSelecting("start"); }} className="text-[10px] text-accent">重設</button>
      </div>
    </div>
  );
}

function EventFormModal({ onClose, onSave, currency, editingEvent }: { onClose: () => void; onSave: (e: Omit<MarketEvent, "id" | "createdAt">) => void; currency: string; editingEvent: MarketEvent | null }) {
  const [name, setName] = useState(editingEvent?.name || "");
  const [startDate, setStartDate] = useState(editingEvent?.startDate || toDateKey(new Date()));
  const [endDate, setEndDate] = useState(editingEvent?.endDate || toDateKey(new Date()));
  const [location, setLocation] = useState(editingEvent?.location || "");
  const [boothFee, setBoothFee] = useState(editingEvent ? String(editingEvent.boothFee) : "");
  const [feeType, setFeeType] = useState<"total" | "daily">(editingEvent?.feeType || "daily");
  const [autoAddFee, setAutoAddFee] = useState(editingEvent?.autoAddFee ?? true);
  const [boothNumber, setBoothNumber] = useState(editingEvent?.boothNumber || "");
  const [businessHours, setBusinessHours] = useState(editingEvent?.businessHours || "");
  const [notes, setNotes] = useState(editingEvent?.notes || "");
  const [color, setColor] = useState(editingEvent?.color || EVENT_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) { alert("請輸入t.markets_market_name"); return; }
    if (endDate < startDate) { alert("結束日期不能早於開始日期"); return; }
    onSave({ name: name.trim(), startDate, endDate, location: location.trim(), boothFee: parseFloat(boothFee) || 0, feeType, autoAddFee, boothNumber: boothNumber.trim(), businessHours: businessHours.trim(), notes: notes.trim(), color });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fadeIn_0.15s_ease-out]" onClick={onClose}>
      <Card className="w-full max-w-xs max-h-[88vh] overflow-y-auto scrollbar-hide p-5 space-y-3 animate-[scaleIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between sticky top-0 bg-card pb-2 z-10">
          <h3 className="text-base font-semibold text-foreground">{editingEvent ? "編輯市集" : "新增市集"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        {/* Agoda 風格日期選擇 — 移到最上面 */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">t.markets_date_range</p>
          <div className="bg-muted/30 rounded-lg p-3">
            <AgodaDatePicker startDate={startDate} endDate={endDate} onSelect={(s, e) => { setStartDate(s); setEndDate(e); }} />
          </div>
        </div>

        <div><p className="text-xs font-medium text-muted-foreground mb-1">t.markets_market_name *</p><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：PMQ 週末市集" className="bg-background h-9 text-sm" /></div>

        <div><p className="text-xs font-medium text-muted-foreground mb-1">t.markets_location</p><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例如：中環 PMQ" className="bg-background h-9 text-sm" /></div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">t.markets_booth_fee（{CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol}）</p>
          <div className="flex gap-2">
            <Input type="number" value={boothFee} onChange={(e) => setBoothFee(e.target.value)} placeholder="0" className="bg-background h-9 text-sm flex-1" />
            <div className="flex bg-muted rounded-lg p-0.5">
              <button type="button" onClick={() => setFeeType("daily")} className={`px-2.5 py-1 text-[11px] rounded-md transition ${feeType === "daily" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>每天</button>
              <button type="button" onClick={() => setFeeType("total")} className={`px-2.5 py-1 text-[11px] rounded-md transition ${feeType === "total" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>總計</button>
            </div>
          </div>
        </div>

        <button type="button" onClick={() => setAutoAddFee(!autoAddFee)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition ${autoAddFee ? "border-emerald-400 bg-emerald-50" : "border-border bg-background"}`}>
          <div><p className="text-xs font-medium text-foreground">t.markets_auto_fee</p><p className="text-[10px] text-muted-foreground">t.markets_auto_fee_desc</p></div>
          <div className={`w-9 h-5 rounded-full transition flex items-center ${autoAddFee ? "bg-emerald-500 justify-end" : "bg-muted-foreground/30 justify-start"}`}><div className="w-4 h-4 rounded-full bg-white shadow-sm mx-0.5" /></div>
        </button>

        <div><p className="text-xs font-medium text-muted-foreground mb-1">t.markets_booth_number</p><Input value={boothNumber} onChange={(e) => setBoothNumber(e.target.value)} placeholder="例如：A12" className="bg-background h-9 text-sm" /></div>
        <div><p className="text-xs font-medium text-muted-foreground mb-1">t.markets_business_hours</p><Input value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} placeholder="例如：10:00-18:00" className="bg-background h-9 text-sm" /></div>
        <div><p className="text-xs font-medium text-muted-foreground mb-1">t.markets_color</p><div className="flex gap-2">{EVENT_COLORS.map((c) => <button key={c} type="button" onClick={() => setColor(c)} className={`w-6 h-6 rounded-full transition ${color === c ? "ring-2 ring-offset-1 ring-foreground" : ""}`} style={{ backgroundColor: c }} />)}</div></div>
        <div><p className="text-xs font-medium text-muted-foreground mb-1">t.markets_notes</p><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="其他資訊..." className="bg-background text-sm min-h-[50px]" maxLength={200} /></div>

        <Button onClick={handleSave} className="w-full h-10">{editingEvent ? "儲存修改" : "新增市集"}</Button>
      </Card>
    </div>
  );
}

// ── t.markets_sticky_notes元件 ──
const NOTE_COLORS = [
  "#FEF3C7", // 淺黃
  "#FCE7F3", // 淺粉
  "#DBEAFE", // 淺藍
  "#D1FAE5", // 淺綠
  "#FED7AA", // 淺橘
  "#E9D5FF", // 淺紫
  "#FECACA", // 淺紅
  "#C7D2FE", // 淺靛
];

function StickyNotesSection({
  notes, onAdd, onUpdate, onDelete,
}: {
  notes: { id: string; text: string; color: string; createdAt: number }[];
  onAdd: (text: string, color: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newText, setNewText] = useState("");
  const [newColor, setNewColor] = useState(NOTE_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAdd(newText.trim(), newColor);
    setNewText("");
    setNewColor(NOTE_COLORS[0]);
    setShowAdd(false);
  };

  const handleEditSave = (id: string) => {
    if (!editText.trim()) {
      onDelete(id);
    } else {
      onUpdate(id, editText.trim());
    }
    setEditingId(null);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return `今日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div>
      {/* 標題 + 新增按鈕 */}
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">t.markets_sticky_notes</p>
          {notes.length > 0 && <span className="text-[10px] text-muted-foreground">({notes.length})</span>}
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-[11px] text-accent hover:text-foreground px-2 py-1 rounded-md hover:bg-accent/10 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          新增
        </button>
      </div>

      {/* 新增便條 */}
      {showAdd && (
        <Card className="p-3 mb-2 animate-[fadeIn_0.2s_ease-out]">
          {/* 顏色選擇 */}
          <div className="flex gap-1.5 mb-2 flex-wrap">
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition ${newColor === c ? "border-foreground scale-110 ring-2 ring-offset-1 ring-foreground/20" : "border-white/60"}`}
                style={{ backgroundColor: c }}
                aria-label={`顏色 ${c}`}
              />
            ))}
          </div>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="寫下你想記的事…"
            className="w-full bg-background rounded-lg p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 resize-none min-h-[50px] outline-none focus:ring-1 focus:ring-accent/40 transition"
            maxLength={200}
            autoFocus
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-[9px] text-muted-foreground/60">{newText.length}/200</span>
            <div className="flex gap-1.5">
              <button onClick={() => { setShowAdd(false); setNewText(""); }} className="text-[11px] text-muted-foreground hover:text-foreground px-2 py-1">取消</button>
              <button onClick={handleAdd} className="text-[11px] text-accent font-medium hover:text-foreground px-2 py-1">貼上</button>
            </div>
          </div>
        </Card>
      )}

      {/* t.markets_sticky_notes列表 */}
      {notes.length === 0 && !showAdd ? (
        <Card className="p-4 text-center border-dashed">
          <p className="text-[11px] text-muted-foreground">點「新增」寫下t.markets_sticky_notes</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {notes.map((note, i) => {
            const isEditing = editingId === note.id;
            const rotation = i % 2 === 0 ? "-rotate-1" : "rotate-1";
            return (
              <div
                key={note.id}
                className={`relative p-2.5 rounded-lg shadow-sm ${rotation} transition-all hover:rotate-0 hover:shadow-md`}
                style={{ backgroundColor: note.color }}
              >
                {/* 刪除按鈕 */}
                <button
                  onClick={() => onDelete(note.id)}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-100/50 transition"
                  aria-label="刪除"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
                {/* 內容 */}
                {isEditing ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => handleEditSave(note.id)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEditSave(note.id); } }}
                    className="w-full bg-white/50 rounded p-1 text-[11px] text-foreground resize-none outline-none min-h-[40px]"
                    autoFocus
                    maxLength={200}
                  />
                ) : (
                  <p
                    onClick={() => { setEditingId(note.id); setEditText(note.text); }}
                    className="text-[11px] text-foreground leading-relaxed whitespace-pre-wrap break-words cursor-text min-h-[20px] pr-3"
                  >
                    {note.text}
                  </p>
                )}
                {/* 時間 */}
                <p className="text-[8px] text-muted-foreground/60 mt-1">{formatTime(note.createdAt)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
