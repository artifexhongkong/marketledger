"use client";

import { useState, useMemo } from "react";
import { useAppStore, formatCurrency, CURRENCIES, type MarketEvent, getCategoryInfo, getPaymentMethodInfo } from "@/lib/store";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, MapPin, Calendar, Clock, Store, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff, Pencil, Inbox, ArrowUpRight, ArrowDownRight, User } from "lucide-react";

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
  const { marketEvents, addMarketEvent, deleteMarketEvent, updateMarketEvent, currency, transactions, customPaymentMethods } = useAppStore();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MarketEvent | null>(null);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [showProfit, setShowProfit] = useState(true);
  // 選中的日期（點擊日曆某天 → 顯示該天交易列表）
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // 年份/月份 picker 狀態
  const [showPicker, setShowPicker] = useState<"none" | "year" | "month">("none");

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
    const dailyAmount = e.feeType === "total" ? Math.round(e.boothFee / totalDays) : e.boothFee;
    const newTxs: any[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayTs = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0).getTime();
      newTxs.push({
        id: `tx_mkt_${dayTs}_${Math.random().toString(36).slice(2, 6)}`,
        type: "expense", amount: dailyAmount, currency, category: "rent",
        paymentMethod: "cash", note: `${e.name} 攤位費`, marketId: eventId, createdAt: dayTs,
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
          <h1 className="text-xl font-bold text-foreground">市集日曆</h1>
          <p className="text-[11px] text-muted-foreground mt-0.5">點日期看記錄 · 看市集活動</p>
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
          {/* 帳號鈕 — 只顯示圖示，不含「帳號」文字 */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("navigate-tab", { detail: "account" }))}
            className="w-8 h-8 rounded-full bg-accent/10 hover:bg-accent/20 border border-accent/20 transition flex items-center justify-center overflow-hidden flex-shrink-0"
            aria-label="帳號"
          >
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-accent" />
            )}
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
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted"><ChevronLeft className="w-4 h-4 text-foreground" /></button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowPicker(showPicker === "year" ? "none" : "year")}
              className={`px-2 py-0.5 rounded text-sm font-bold text-foreground hover:bg-muted transition ${showPicker === "year" ? "bg-muted" : ""}`}
            >
              {viewYear}年
            </button>
            <button
              onClick={() => setShowPicker(showPicker === "month" ? "none" : "month")}
              className={`px-2 py-0.5 rounded text-sm font-bold text-foreground hover:bg-muted transition ${showPicker === "month" ? "bg-muted" : ""}`}
            >
              {MONTHS[viewMonth]}
            </button>
          </div>
          <button onClick={nextMonth} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted"><ChevronRight className="w-4 h-4 text-foreground" /></button>
        </div>

        {/* 年份 picker */}
        {showPicker === "year" && (
          <div className="mb-2 p-2 bg-muted/40 rounded-lg">
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 9 }, (_, i) => viewYear - 4 + i).map((y) => (
                <button
                  key={y}
                  onClick={() => { setViewYear(y); setShowPicker("none"); setSelectedDate(null); }}
                  className={`py-1.5 rounded text-[11px] font-medium transition ${
                    y === viewYear ? "bg-accent text-accent-foreground" : "bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {y}年
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 月份 picker */}
        {showPicker === "month" && (
          <div className="mb-2 p-2 bg-muted/40 rounded-lg">
            <div className="grid grid-cols-4 gap-1">
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  onClick={() => { setViewMonth(i); setShowPicker("none"); setSelectedDate(null); }}
                  className={`py-1.5 rounded text-[11px] font-medium transition ${
                    i === viewMonth ? "bg-accent text-accent-foreground" : "bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-7 gap-0.5 mb-1">{WEEKDAYS.map((w) => <div key={w} className="text-center text-[9px] font-medium text-muted-foreground py-0.5">{w}</div>)}</div>
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            const isSelected = selectedDate === day.dateKey;
            return (
              <button key={day.dateKey} onClick={() => setSelectedDate(isSelected ? null : day.dateKey)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] transition-all border
                  ${isSelected ? "bg-accent text-accent-foreground border-accent shadow" : "border-transparent"}
                  ${!isSelected && day.events.length > 0 ? "bg-muted/40" : ""}
                  ${!isSelected && day.hasTx && day.events.length === 0 ? "bg-primary/5" : ""}
                  ${!isSelected ? "hover:bg-muted" : ""}
                  ${day.isToday && !isSelected ? "ring-1 ring-accent/40" : ""}`}>
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

      {/* 即將到來市集 */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">即將到來</p>
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

      {marketEvents.length === 0 && (
        <Card className="p-6 text-center border-dashed"><Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-1" /><p className="text-xs text-muted-foreground">點「新增」添加市集活動</p><p className="text-[11px] text-muted-foreground/60 mt-0.5">選擇日期範圍，自動記帳攤位費</p></Card>
      )}

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
          {event.boothNumber && <InfoRow icon={<Store className="w-3 h-3" />} label="攤位編號" value={event.boothNumber} />}
          {event.businessHours && <InfoRow icon={<Clock className="w-3 h-3" />} label="營業時段" value={event.businessHours} />}
          {event.notes && <InfoRow icon={<Calendar className="w-3 h-3" />} label="備註" value={event.notes} />}
          {event.autoAddFee && <p className="text-[10px] text-emerald-600">✓ 已自動記帳攤位費</p>}
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
    // 狀態機（用 selecting + 是否已有範圍判斷）：
    //   selecting === "end" → 正在選結束日
    //     - key < start → 重設 start = end = key（重新開始）
    //     - key === start → 單日市集，完成（selecting 回 start）
    //     - key > start → 完成 end，selecting 回 start
    //   selecting === "start" 且已有完整範圍（start !== end）→ 「已選好」狀態
    //     - 點到 start 或 end → 清除變未選
    //     - 點其他日期 → 重設 start = end = key（開始新選擇）
    //   selecting === "start" 且未選過（start === end）→ 初次選
    //     - 設 start = end = key，selecting 進入 end

    const hasRange = tempStart !== "" && tempEnd !== "" && tempEnd !== tempStart;

    if (selecting === "end") {
      if (key < tempStart) {
        setTempStart(key); setTempEnd(key);
      } else {
        setTempEnd(key); setSelecting("start");
      }
    } else {
      // selecting === "start"
      if (hasRange && (key === tempStart || key === tempEnd)) {
        // 已選好一輪，點到邊界 → 清除
        setTempStart(""); setTempEnd("");
      } else {
        // 初次或重設
        setTempStart(key); setTempEnd(key); setSelecting("end");
      }
    }
    onSelect(tempStart, tempEnd);
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
    if (!name.trim()) { alert("請輸入市集名稱"); return; }
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

        <div><p className="text-xs font-medium text-muted-foreground mb-1">市集名稱 *</p><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：PMQ 週末市集" className="bg-background h-9 text-sm" /></div>

        {/* Agoda 風格日期選擇 */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">日期範圍</p>
          <div className="bg-muted/30 rounded-lg p-3">
            <AgodaDatePicker startDate={startDate} endDate={endDate} onSelect={(s, e) => { setStartDate(s); setEndDate(e); }} />
          </div>
        </div>

        <div><p className="text-xs font-medium text-muted-foreground mb-1">地點</p><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例如：中環 PMQ" className="bg-background h-9 text-sm" /></div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">攤位費用（{CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol}）</p>
          <div className="flex gap-2">
            <Input type="number" value={boothFee} onChange={(e) => setBoothFee(e.target.value)} placeholder="0" className="bg-background h-9 text-sm flex-1" />
            <div className="flex bg-muted rounded-lg p-0.5">
              <button type="button" onClick={() => setFeeType("daily")} className={`px-2.5 py-1 text-[11px] rounded-md transition ${feeType === "daily" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>每天</button>
              <button type="button" onClick={() => setFeeType("total")} className={`px-2.5 py-1 text-[11px] rounded-md transition ${feeType === "total" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>總計</button>
            </div>
          </div>
        </div>

        <button type="button" onClick={() => setAutoAddFee(!autoAddFee)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition ${autoAddFee ? "border-emerald-400 bg-emerald-50" : "border-border bg-background"}`}>
          <div><p className="text-xs font-medium text-foreground">自動記帳攤位費</p><p className="text-[10px] text-muted-foreground">每天自動加上攤位費支出</p></div>
          <div className={`w-9 h-5 rounded-full transition flex items-center ${autoAddFee ? "bg-emerald-500 justify-end" : "bg-muted-foreground/30 justify-start"}`}><div className="w-4 h-4 rounded-full bg-white shadow-sm mx-0.5" /></div>
        </button>

        <div><p className="text-xs font-medium text-muted-foreground mb-1">攤位編號</p><Input value={boothNumber} onChange={(e) => setBoothNumber(e.target.value)} placeholder="例如：A12" className="bg-background h-9 text-sm" /></div>
        <div><p className="text-xs font-medium text-muted-foreground mb-1">營業時段</p><Input value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} placeholder="例如：10:00-18:00" className="bg-background h-9 text-sm" /></div>
        <div><p className="text-xs font-medium text-muted-foreground mb-1">標記顏色</p><div className="flex gap-2">{EVENT_COLORS.map((c) => <button key={c} type="button" onClick={() => setColor(c)} className={`w-6 h-6 rounded-full transition ${color === c ? "ring-2 ring-offset-1 ring-foreground" : ""}`} style={{ backgroundColor: c }} />)}</div></div>
        <div><p className="text-xs font-medium text-muted-foreground mb-1">備註</p><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="其他資訊..." className="bg-background text-sm min-h-[50px]" maxLength={200} /></div>

        <Button onClick={handleSave} className="w-full h-10">{editingEvent ? "儲存修改" : "新增市集"}</Button>
      </Card>
    </div>
  );
}
