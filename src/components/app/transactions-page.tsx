"use client";

import { useState, useMemo } from "react";
import { useAppStore, getDailySummary, formatCurrency, formatDateTime, getCategoryInfo, getPaymentMethodInfo } from "@/lib/store";
import { groupTransactions, getOrderSummary, type TxGroup } from "@/lib/tx-group";
import { useFormatCurrency } from "@/lib/exchange-rates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Inbox, ChevronRight, Receipt, ShoppingBag } from "lucide-react";

export function TransactionsPage() {
  const { transactions, currency, currentMarketId, markets } = useAppStore();
  const fc = useFormatCurrency();
  const summary = getDailySummary(transactions);
  const currentMarket = markets.find((m) => m.id === currentMarketId);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // 今日全部交易，按時間倒序
  const todayTx = summary.todayTransactions.slice().sort((a, b) => b.createdAt - a.createdAt);
  const groups = useMemo(() => groupTransactions(todayTx), [todayTx]);

  return (
    <div className="px-4 pb-4 space-y-4">
      {/* 標題區 */}
      <div className="pt-2">
        <p className="text-[11px] text-muted-foreground tracking-wide">
          {new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
        </p>
        <h1 className="text-xl font-bold tracking-tight mt-0.5 text-foreground">今日記錄</h1>
        {currentMarket && (
          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] bg-primary/8 text-primary px-2 py-0.5 rounded-full">
            📍 {currentMarket.name}
          </div>
        )}
      </div>

      {/* 摘要 Hero 卡 */}
      <div className="bg-gradient-to-br from-primary to-primary/85 rounded-2xl p-4 text-primary-foreground shadow-lg">
        <p className="text-[11px] text-primary-foreground/60 uppercase tracking-wider">今日淨利</p>
        <p className="text-3xl font-bold tabular-nums mt-0.5">
          {summary.profit >= 0 ? "+" : "−"}{fc(Math.abs(summary.profit))}
        </p>
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-300" />
            <span className="text-primary-foreground/60">收</span>
            <span className="font-semibold tabular-nums">{fc(summary.income)}</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-rose-300" />
            <span className="text-primary-foreground/60">支</span>
            <span className="font-semibold tabular-nums">{fc(summary.expense)}</span>
          </div>
          <span className="text-primary-foreground/60">{summary.count} 筆</span>
        </div>
      </div>

      {/* 交易記錄（分組顯示） */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-bold text-foreground">交易記錄</h2>
          <span className="text-[11px] text-muted-foreground">{groups.length} 組</span>
        </div>
        {groups.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">今日還沒有交易記錄</p>
            <p className="text-xs text-muted-foreground mt-1">前往「記帳」頁面開始記錄</p>
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
  currency: string;
  isExpanded: boolean;
  onToggle: () => void;
  compact?: boolean; // 緊湊模式（首頁用）
}) {
  const customPaymentMethods = useAppStore((s) => s.customPaymentMethods);
  const fc = useFormatCurrency();
  const firstTx = group.txs[0];
  const cat = getCategoryInfo(firstTx.category);
  const pay = firstTx.paymentMethod ? getPaymentMethodInfo(firstTx.paymentMethod, useAppStore.getState().customPaymentMethods) : null;
  const isIncome = firstTx.type === "income";
  const summary = getOrderSummary(group);

  if (group.type === "single") {
    // 單筆交易（含支出）— 直接顯示
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
            {isIncome ? "+" : "−"}{fc(firstTx.amount)}
          </span>
        </div>
      </Card>
    );
  }

  // 訂單組（多筆）— 可展開
  return (
    <Card className="overflow-hidden animate-[fadeIn_0.2s_ease-out]">
      {/* 訂單標題（點擊展開/收起） */}
      <button
        onClick={onToggle}
        className={`w-full ${compact ? "p-2.5" : "p-3"} flex items-center gap-2.5 hover:bg-muted/30 transition text-left`}
      >
        <div className={`${compact ? "w-8 h-8" : "w-9 h-9"} rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0`}>
          <ShoppingBag className={`${compact ? "w-4 h-4" : "w-4.5 h-4.5"} text-primary`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-foreground">商品</p>
            <span className="text-[9px] text-muted-foreground bg-muted px-1 rounded">{group.txs.length} 項</span>
            {pay && (
              <span className="text-[9px] text-muted-foreground bg-muted px-1 rounded">{pay.label}</span>
            )}
          </div>
          {/* 商品摘要 — 小字直接顯示賣了什麼 */}
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {summary}
          </p>
          <p className="text-[9px] text-muted-foreground/70 mt-0.5">
            {formatDateTime(firstTx.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-sm font-bold tabular-nums text-primary">
            +{fc(group.totalAmount)}
          </span>
          <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        </div>
      </button>

      {/* 展開後的明細 */}
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
                    {tx.note?.replace(/ x\d+$/, "") || txCat?.label || "銷售"}
                  </p>
                  {tx.note?.includes(" · ") && (
                    <p className="text-[9px] text-accent truncate">
                      {tx.note.split(" · ").slice(1).join(" · ")}
                    </p>
                  )}
                </div>
                <span className="text-[11px] font-semibold tabular-nums text-primary flex-shrink-0">
                  +{fc(tx.amount)}
                </span>
              </div>
            );
          })}
          {/* 訂單總計 */}
          <div className="px-3 py-2 bg-primary/5 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-foreground">合計</span>
            <span className="text-xs font-bold tabular-nums text-primary">
              {fc(group.totalAmount)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
