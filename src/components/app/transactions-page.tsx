"use client";

import { useState, useMemo } from "react";
import { useAppStore, getDailySummary, formatCurrency, formatDateTime, getCategoryInfo, getPaymentMethodInfo, CATEGORIES } from "@/lib/store";
import { groupTransactions, getOrderSummary, type TxGroup } from "@/lib/tx-group";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, ArrowDownRight, Inbox, ChevronRight, ShoppingBag, Search, X } from "lucide-react";
import { useT } from "@/lib/i18n";

type TimeFilter = "today" | "week" | "month" | "all";

export function TransactionsPage() {
  const t = useT();
  const { transactions, currency, currentMarketId, markets } = useAppStore();
  const summary = getDailySummary(transactions);
  const currentMarket = markets.find((m) => m.id === currentMarketId);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // 根據時間篩選
  const filteredTx = useMemo(() => {
    let txs = transactions.slice().sort((a, b) => b.createdAt - a.createdAt);
    const now = new Date();

    if (timeFilter === "today") {
      txs = txs.filter((t) => {
        const d = new Date(t.createdAt);
        return d.toDateString() === now.toDateString();
      });
    } else if (timeFilter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      txs = txs.filter((t) => new Date(t.createdAt) >= weekAgo);
    } else if (timeFilter === "month") {
      txs = txs.filter((t) => {
        const d = new Date(t.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
    }

    // 分類篩選
    if (categoryFilter !== "all") {
      txs = txs.filter((t) => t.category === categoryFilter);
    }

    // 搜索（商品名/備註）
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      txs = txs.filter((t) =>
        t.note?.toLowerCase().includes(q) ||
        getCategoryInfo(t.category)?.label.toLowerCase().includes(q)
      );
    }

    return txs;
  }, [transactions, timeFilter, categoryFilter, searchQuery]);

  const groups = useMemo(() => groupTransactions(filteredTx), [filteredTx]);

  // 計算篩選後的摘要
  const filteredSummary = useMemo(() => {
    const income = filteredTx.filter((t) => t.type === "income").reduce((a, b) => a + b.amount, 0);
    const expense = filteredTx.filter((t) => t.type === "expense").reduce((a, b) => a + b.amount, 0);
    return { income, expense, profit: income - expense, count: filteredTx.length };
  }, [filteredTx]);

  const timeLabels: Record<TimeFilter, string> = { today: t.today, week: t.week, month: t.month, all: t.all };

  return (
    <div className="px-4 pb-4 space-y-3">
      {/* 標題區 */}
      <div className="pt-2">
        <h1 className="text-xl font-bold tracking-tight text-foreground">{t.transactions_title}</h1>
        {currentMarket && (
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] bg-primary/8 text-primary px-2 py-0.5 rounded-full">
            📍 {currentMarket.name}
          </div>
        )}
      </div>

      {/* 時間篩選 chips */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {(["today", "week", "month", "all"] as TimeFilter[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeFilter(tf)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition flex-shrink-0 ${
              timeFilter === tf
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {timeLabels[tf]}
          </button>
        ))}
      </div>

      {/* 搜索欄 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.transactions_search_placeholder}
          className="bg-background pl-9 pr-9 h-10 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 分類篩選 chips */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition flex-shrink-0 ${
            categoryFilter === "all" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          全部
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition flex-shrink-0 ${
              categoryFilter === c.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* 摘要 Hero 卡 */}
      <div className="bg-gradient-to-br from-primary to-primary/85 rounded-2xl p-4 text-primary-foreground shadow-lg">
        <p className="text-[11px] text-primary-foreground/60 uppercase tracking-wider">
          {timeLabels[timeFilter]}淨利
        </p>
        <p className="text-3xl font-bold tabular-nums mt-0.5">
          {filteredSummary.profit >= 0 ? "+" : "−"}{formatCurrency(Math.abs(filteredSummary.profit), currency)}
        </p>
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-300" />
            <span className="text-primary-foreground/60">收</span>
            <span className="font-semibold tabular-nums">{formatCurrency(filteredSummary.income, currency)}</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-rose-300" />
            <span className="text-primary-foreground/60">支</span>
            <span className="font-semibold tabular-nums">{formatCurrency(filteredSummary.expense, currency)}</span>
          </div>
          <span className="text-primary-foreground/60">{filteredSummary.count} 筆</span>
        </div>
      </div>

      {/* 交易記錄（分組顯示） */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-bold text-foreground">{t.transactions_title}</h2>
          <span className="text-[11px] text-muted-foreground">{groups.length} {t.transactions_groups}</span>
        </div>
        {groups.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              {searchQuery || categoryFilter !== "all" ? t.transactions_no_match : t.transactions_no_records}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery || categoryFilter !== "all" ? t.transactions_no_match_hint : t.transactions_no_records_hint}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <TxGroupCard
                key={group.id}
                group={group}
                currency={currency}
                isExpanded={expandedGroup === group.id}
                onToggle={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 訂單組卡片（共用元件，首頁/記錄頁/市集頁都會用）──
export function TxGroupCard({
  group, currency, isExpanded, onToggle, compact = false,
}: {
  group: TxGroup;
  currency: any;
  isExpanded: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  const t = useT();
  const customPaymentMethods = useAppStore((s) => s.customPaymentMethods);
  const firstTx = group.txs[0];
  const cat = getCategoryInfo(firstTx.category);
  const pay = firstTx.paymentMethod ? getPaymentMethodInfo(firstTx.paymentMethod, useAppStore.getState().customPaymentMethods) : null;
  const isIncome = firstTx.type === "income";
  const summary = getOrderSummary(group);

  if (group.type === "single") {
    return (
      <Card className={`${compact ? "p-2.5" : "p-3"} animate-[fadeIn_0.2s_ease-out]`}>
        <div className="flex items-center gap-2.5">
          <div
            className={`${compact ? "w-8 h-8" : "w-9 h-9"} rounded-full flex items-center justify-center text-sm flex-shrink-0`}
            style={{ backgroundColor: (cat?.color || "#6B7280") + "15" }}
          >
            {cat?.icon || "📝"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-medium text-foreground truncate">{cat?.label || firstTx.category}</p>
              {pay && (
                <span className="text-[9px] text-muted-foreground bg-muted px-1 rounded">{pay.label}</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">
              {summary}{firstTx.note && firstTx.note !== summary && ` · ${formatDateTime(firstTx.createdAt)}`}
              {!firstTx.note && formatDateTime(firstTx.createdAt)}
            </p>
          </div>
          <span
            className={`text-sm font-bold tabular-nums flex-shrink-0 ${compact ? "text-xs" : ""}`}
            style={{ color: isIncome ? "#059669" : "#E11D48" }}
          >
            {isIncome ? "+" : "−"}{formatCurrency(firstTx.amount, currency)}
          </span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      <button
        onClick={onToggle}
        className={`w-full ${compact ? "p-2.5" : "p-3"} flex items-center gap-2.5 hover:bg-muted/30 transition text-left`}
      >
        <div className={`${compact ? "w-8 h-8" : "w-9 h-9"} rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`}>
          <ShoppingBag className={`${compact ? "w-4 h-4" : "w-4.5 h-4.5"} text-primary`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-foreground">{t.transactions_order}</p>
            <span className="text-[9px] text-muted-foreground bg-muted px-1 rounded">{group.txs.length} 項</span>
            {pay && (
              <span className="text-[9px] text-muted-foreground bg-muted px-1 rounded">{pay.label}</span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {summary}
          </p>
          <p className="text-[9px] text-muted-foreground/70 mt-0.5">
            {formatDateTime(firstTx.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-sm font-bold tabular-nums flex-shrink-0" style={{ color: "#059669" }}>
            +{formatCurrency(group.totalAmount, currency)}
          </span>
          <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border divide-y divide-border bg-muted/20">
          {group.txs.map((tx) => {
            const txCat = getCategoryInfo(tx.category);
            return (
              <div key={tx.id} className="flex items-center gap-2 px-3 py-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                  style={{ backgroundColor: (txCat?.color || "#6B7280") + "15" }}
                >
                  {txCat?.icon || "📝"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">
                    {tx.note?.replace(/ x\d+$/, "") || txCat?.label || t.cat_sales}
                  </p>
                  {tx.note?.includes(" · ") && (
                    <p className="text-[9px] text-accent truncate">
                      {tx.note.split(" · ").slice(1).join(" · ")}
                    </p>
                  )}
                </div>
                <span className="text-[11px] font-semibold tabular-nums flex-shrink-0" style={{ color: "#059669" }}>
                  +{formatCurrency(tx.amount, currency)}
                </span>
              </div>
            );
          })}
          <div className="px-3 py-2 bg-primary/5 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-foreground">{t.transactions_summary}</span>
            <span className="text-xs font-bold tabular-nums" style={{ color: "#059669" }}>
              {formatCurrency(group.totalAmount, currency)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
