"use client";

import { useState, useMemo } from "react";
import { useAppStore, formatCurrency, CURRENCIES, type MarketEvent } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, MapPin, Calendar, Clock, Store, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";

const EVENT_COLORS = ["#1A1D24", "#059669", "#E11D48", "#F59E0B", "#7C3AED", "#0891B2"];
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

export function MarketsPage() {
  const { marketEvents, addMarketEvent, deleteMarketEvent, currency, transactions } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [showProfit, setShowProfit] = useState(true); // 日曆顯示盈虧開關

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); } else setViewMonth(viewMonth - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); } else setViewMonth(viewMonth + 1); };

  // 計算某天的盈虧
  const getDayProfit = (dateKey: string) => {
    const dayTxs = transactions.filter((t) => {
      const d = new Date(t.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return key === dateKey;
    });
    const income = dayTxs.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = dayTxs.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return income - expense;
  };

  const monthEvents = useMemo(() => {
    return marketEvents.filter((e) => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      const monthStart = new Date(viewYear, viewMonth, 1);
      const monthEnd = new Date(viewYear, viewMonth + 1, 0);
      return start <= monthEnd && end >= monthStart;
    });
  }, [marketEvents, viewYear, viewMonth]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return marketEvents.filter((e) => e.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [marketEvents]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const todayKey = new Date().toISOString().slice(0, 10);
    const days: any[] = [];
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayEvents = marketEvents.filter((e) => dateKey >= e.startDate && dateKey <= e.endDate);
      const profit = getDayProfit(dateKey);
      days.push({ day: d, dateKey, isToday: dateKey === todayKey, events: dayEvents, profit, hasTx: transactions.some((t) => { const td = new Date(t.createdAt); return `${td.getFullYear()}-${String(td.getMonth()+1).padStart(2,"0")}-${String(td.getDate()).padStart(2,"0")}` === dateKey; }) });
    }
    return days;
  }, [viewYear, viewMonth, marketEvents, transactions]);

  // 月份總盈虧
  const monthProfit = useMemo(() => {
    return calendarDays.filter(Boolean).reduce((sum, d) => sum + (d.profit || 0), 0);
  }, [calendarDays]);

  return (
    <div className="px-4 pb-6 space-y-3">
      {/* Header */}
      <div className="pt-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">市集日曆</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowProfit(!showProfit)}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition ${showProfit ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}
            title={showProfit ? "隱藏金額" : "顯示金額"}>
            {showProfit ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-medium hover:bg-accent/20 transition">
            <Plus className="w-3.5 h-3.5" />新增
          </button>
        </div>
      </div>

      {/* 即將到來 */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">即將到來</p>
          {upcomingEvents.slice(0, 3).map((e) => (
            <EventCard key={e.id} event={e} currency={currency} onDelete={() => deleteMarketEvent(e.id)} />
          ))}
        </div>
      )}

      {/* 日曆 */}
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="text-center">
            <span className="text-sm font-bold text-foreground">{viewYear} {MONTHS[viewMonth]}</span>
            {showProfit && (
              <span className={`block text-[10px] font-medium tabular-nums ${monthProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                月盈虧 {monthProfit >= 0 ? "+" : "−"}{formatCurrency(Math.abs(monthProfit), currency)}
              </span>
            )}
          </div>
          <button onClick={nextMonth} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAYS.map((w) => <div key={w} className="text-center text-[9px] font-medium text-muted-foreground py-0.5">{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, i) => {
            if (!day) return <div key={`e-${i}`} />;
            return (
              <div key={day.dateKey}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] border ${day.isToday ? "border-accent/40" : "border-transparent"} ${day.events.length > 0 ? "bg-muted/40" : ""}`}>
                <span className={`font-medium leading-none ${day.isToday ? "text-accent" : "text-foreground"}`}>{day.day}</span>
                {/* 每日盈虧 */}
                {showProfit && day.hasTx && (
                  <span className={`text-[8px] tabular-nums mt-0.5 leading-none ${day.profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {day.profit >= 0 ? "+" : "−"}{Math.abs(day.profit) >= 1000 ? `${(Math.abs(day.profit) / 1000).toFixed(1)}k` : Math.abs(day.profit)}
                  </span>
                )}
                {/* 市集標記 */}
                {day.events.length > 0 && (
                  <div className="absolute bottom-0.5 flex gap-0.5">
                    {day.events.slice(0, 3).map((e, ei) => (
                      <div key={ei} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: e.color }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 這個月的市集 */}
      {monthEvents.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
            {MONTHS[viewMonth]}市集（{monthEvents.length}）
          </p>
          {monthEvents.map((e) => (
            <EventCard key={e.id} event={e} currency={currency} onDelete={() => deleteMarketEvent(e.id)} />
          ))}
        </div>
      )}

      {marketEvents.length === 0 && (
        <Card className="p-6 text-center border-dashed">
          <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">點「新增」添加市集活動</p>
          <p className="text-[11px] text-muted-foreground/60 mt-0.5">選擇日期範圍，自動記帳攤位費</p>
        </Card>
      )}

      {showForm && (
        <EventFormModal onClose={() => setShowForm(false)} onSave={(data) => { addMarketEvent(data); setShowForm(false); }} currency={currency} />
      )}
    </div>
  );
}

function EventCard({ event, currency, onDelete }: { event: MarketEvent; currency: string; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const days = Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / 86400000) + 1;
  const dailyFee = event.feeType === "daily" ? event.boothFee : event.boothFee;
  const totalFee = event.feeType === "daily" ? event.boothFee * days : event.boothFee;

  return (
    <Card className="overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      <div className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-2">
          <div className="w-1 self-stretch rounded-full" style={{ backgroundColor: event.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{event.name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5" />
                {event.startDate === event.endDate ? event.startDate : `${event.startDate.slice(5)} ~ ${event.endDate.slice(5)}`}
              </span>
              {event.location && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />{event.location}
                </span>
              )}
            </div>
            {event.boothFee > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                攤位費 {formatCurrency(dailyFee, currency as any)}{event.feeType === "daily" ? "/天" : ""}
                <span className="text-muted-foreground/60"> · 共 {formatCurrency(totalFee, currency as any)}</span>
              </p>
            )}
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
          <button onClick={onDelete} className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 mt-1">
            <Trash2 className="w-3 h-3" />刪除
          </button>
        </div>
      )}
    </Card>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}：</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function EventFormModal({ onClose, onSave, currency }: { onClose: () => void; onSave: (e: Omit<MarketEvent, "id" | "createdAt">) => void; currency: string }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("");
  const [boothFee, setBoothFee] = useState("");
  const [feeType, setFeeType] = useState<"total" | "daily">("daily");
  const [autoAddFee, setAutoAddFee] = useState(true);
  const [boothNumber, setBoothNumber] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState(EVENT_COLORS[0]);

  const handleSave = () => {
    if (!name.trim()) { alert("請輸入市集名稱"); return; }
    if (endDate < startDate) { alert("結束日期不能早於開始日期"); return; }
    onSave({
      name: name.trim(), startDate, endDate, location: location.trim(),
      boothFee: parseFloat(boothFee) || 0, feeType, autoAddFee,
      boothNumber: boothNumber.trim(), businessHours: businessHours.trim(),
      notes: notes.trim(), color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-[fadeIn_0.15s_ease-out]" onClick={onClose}>
      <Card className="w-full max-w-xs max-h-[85vh] overflow-y-auto scrollbar-hide p-5 space-y-3 animate-[scaleIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between sticky top-0 bg-card pb-2">
          <h3 className="text-base font-semibold text-foreground">新增市集</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">市集名稱 *</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：PMQ 週末市集" className="bg-background h-9 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">開始日期</p>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-background h-9 text-sm" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">結束日期</p>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-background h-9 text-sm" />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">地點</p>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="例如：中環 PMQ" className="bg-background h-9 text-sm" />
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">攤位費用（{CURRENCIES[currency as keyof typeof CURRENCIES]?.symbol}）</p>
          <div className="flex gap-2">
            <Input type="number" value={boothFee} onChange={(e) => setBoothFee(e.target.value)} placeholder="0" className="bg-background h-9 text-sm flex-1" />
            <div className="flex bg-muted rounded-lg p-0.5">
              <button onClick={() => setFeeType("daily")} className={`px-2.5 py-1 text-[11px] rounded-md transition ${feeType === "daily" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>每天</button>
              <button onClick={() => setFeeType("total")} className={`px-2.5 py-1 text-[11px] rounded-md transition ${feeType === "total" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>總計</button>
            </div>
          </div>
        </div>

        <button onClick={() => setAutoAddFee(!autoAddFee)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition ${autoAddFee ? "border-emerald-400 bg-emerald-50" : "border-border bg-background"}`}>
          <div>
            <p className="text-xs font-medium text-foreground">自動記帳攤位費</p>
            <p className="text-[10px] text-muted-foreground">每天自動加上攤位費支出</p>
          </div>
          <div className={`w-9 h-5 rounded-full transition flex items-center ${autoAddFee ? "bg-emerald-500 justify-end" : "bg-muted-foreground/30 justify-start"}`}>
            <div className="w-4 h-4 rounded-full bg-white shadow-sm mx-0.5" />
          </div>
        </button>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">攤位編號</p>
          <Input value={boothNumber} onChange={(e) => setBoothNumber(e.target.value)} placeholder="例如：A12" className="bg-background h-9 text-sm" />
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">營業時段</p>
          <Input value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} placeholder="例如：10:00-18:00" className="bg-background h-9 text-sm" />
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">標記顏色</p>
          <div className="flex gap-2">
            {EVENT_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition ${color === c ? "ring-2 ring-offset-1 ring-foreground" : ""}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">備註</p>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="其他資訊..." className="bg-background text-sm min-h-[50px]" maxLength={200} />
        </div>

        <Button onClick={handleSave} className="w-full h-10">新增市集</Button>
      </Card>
    </div>
  );
}
