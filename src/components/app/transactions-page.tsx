"use client";

import { useState, useMemo } from "react";
import { useAppStore, getDailySummary, formatCurrency, formatDateTime, getCategoryInfo, getPaymentMethodInfo } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Inbox, ChevronRight, Receipt } from "lucide-react";

// 分組交易：相鄰的 income 交易如果時間差 < 60 秒，視為同一組訂單
interface TxGroup {
  groupId: string;
  type: "single" | "order"; // single = 單筆（含支出），order = 多筆訂單
  txs: typeof useAppStore extends { getState: () => { transactions: infer T } } ? T : never;
  totalAmount: number;
  startTime: number;
}

export function TransactionsPage() {
  const { transactions, currency, currentMarketId, markets } = useAppStore();
  const summary = getDailySummary(transactions);
  const currentMarket = markets.find((m) => m.id === currentMarketId);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // 今日全部交易，按時間倒序
  const todayTx = summary.todayTransactions.slice().sort((a, b) => b.createdAt - a.createdAt);

  // 分組邏輯
  const groupedTx = useMemo(() => {
    const groups: { id: string; type: "single" | "order"; txs: typeof todayTx; total: number; time: number }[] = [];
    let currentGroup: { id: string; type: "single" | "order"; txs: typeof todayTx; total: number; time: number } | null = null;

    todayTx.forEach((tx) => {
      if (tx.type === "expense") {
        // 支出獨立一組
        if (currentGroup) { groups.push(currentGroup); currentGroup = null; }
        groups.push({
          id: tx.id,
          type: "single",
          txs: [tx],
          total: tx.amount,
          time: tx.createdAt,
        });
      } else {
        // 收入 — 檢查是否跟上一筆屬於同一組
        if (currentGroup && (currentGroup.time - tx.createdAt) < 60000) {
          // 同一組（時間差 < 60 秒）
          currentGroup.txs.push(tx);
          currentGroup.total += tx.amount;
          currentGroup.time = tx.createdAt; // 更新為最新的
        } else {
          // 新的一組
          if (currentGroup) groups.push(currentGroup);
          currentGroup = {
            id: `group_${tx.createdAt}`,
            type: "single",
            txs: [tx],
            total: tx.amount,
            time: tx.createdAt,
          };
        }
      }
    });
    if (currentGroup) groups.push(currentGroup);

    // 如果一組裡有多筆，標記為 order
    groups.forEach((g) => { if (g.txs.length > 1) g.type = "order"; });

    return groups;
  }, [todayTx]);

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

      {/* 交易記錄（分組顯示） */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">交易記錄</h2>
          <Badge variant="secondary" className="text-xs font-medium">{groupedTx.length} 組</Badge>
        </div>
        {groupedTx.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">今日還沒有交易記錄</p>
            <p className="text-xs text-muted-foreground mt-1">前往「記帳」頁面開始記錄</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {groupedTx.map((group) => {
              const isExpanded = expandedGroup === group.id;
              const firstTx = group.txs[0];
              const cat = getCategoryInfo(firstTx.category);
              const pay = firstTx.paymentMethod ? getPaymentMethodInfo(firstTx.paymentMethod, useAppStore.getState().customPaymentMethods) : null;
              const isIncome = firstTx.type === "income";

              if (group.type === "single") {
                // 單筆交易（含支出）— 直接顯示
                return (
                  <Card key={group.id} className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-base flex-shrink-0"
                        style={{ backgroundColor: (cat?.color || "#6B7280") + "15" }}
                      >
                        {cat?.icon || "📝"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{cat?.label || firstTx.category}</p>
                          {pay && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground">
                              {pay.label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDateTime(firstTx.createdAt)}
                          {firstTx.note && ` · ${firstTx.note}`}
                        </p>
                      </div>
                      <span
                        className="text-sm font-semibold tabular-nums flex-shrink-0"
                        style={{ color: isIncome ? "#059669" : "#E11D48" }}
                      >
                        {isIncome ? "+" : "−"}{firstTx.amount.toLocaleString()}
                      </span>
                    </div>
                  </Card>
                );
              }

              // 訂單組（多筆）— 可展開
              return (
                <Card key={group.id} className="overflow-hidden">
                  {/* 訂單標題（點擊展開/收起） */}
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                    className="w-full p-3.5 flex items-center gap-3 hover:bg-muted/30 transition text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">訂單</p>
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                          {group.txs.length} 項
                        </Badge>
                        {pay && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal text-muted-foreground">
                            {pay.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(firstTx.createdAt)}
                        {group.txs.length > 1 && ` · 共 ${group.txs.length} 項商品`}
                      </p>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-primary flex-shrink-0">
                      +{group.total.toLocaleString()}
                    </span>
                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  {/* 展開後的明細 */}
                  {isExpanded && (
                    <div className="border-t border-border divide-y divide-border bg-muted/20">
                      {group.txs.map((tx) => {
                        const txCat = getCategoryInfo(tx.category);
                        return (
                          <div key={tx.id} className="flex items-center gap-2 px-4 py-2.5">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                              style={{ backgroundColor: (txCat?.color || "#6B7280") + "15" }}
                            >
                              {txCat?.icon || "📝"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {tx.note || txCat?.label || "銷售"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                {formatDateTime(tx.createdAt)}
                              </p>
                            </div>
                            <span className="text-xs font-semibold tabular-nums text-primary flex-shrink-0">
                              +{tx.amount.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                      {/* 訂單總計 */}
                      <div className="px-4 py-2 bg-primary/5 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-foreground">訂單總計</span>
                        <span className="text-sm font-bold tabular-nums text-primary">
                          {formatCurrency(group.total, currency)}
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
