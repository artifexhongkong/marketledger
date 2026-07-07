// 交易分組工具 — 把相鄰的 income 交易（時間差 < 60 秒）合併為同一組訂單
// 支出交易獨立一組

import type { Transaction } from "@/lib/store";

export interface TxGroup {
  id: string;
  type: "single" | "order"; // single = 單筆（含支出），order = 多筆訂單
  txs: Transaction[];
  totalAmount: number;
  startTime: number;
  itemCount: number; // 訂單內商品總數量（含數量）
}

// 把交易清單分組
export function groupTransactions(transactions: Transaction[]): TxGroup[] {
  // 先按時間倒序
  const sorted = [...transactions].sort((a, b) => b.createdAt - a.createdAt);
  const groups: TxGroup[] = [];
  let currentGroup: TxGroup | null = null;

  sorted.forEach((tx) => {
    if (tx.type === "expense") {
      // 支出獨立一組
      if (currentGroup) { groups.push(currentGroup); currentGroup = null; }
      groups.push({
        id: tx.id,
        type: "single",
        txs: [tx],
        totalAmount: tx.amount,
        startTime: tx.createdAt,
        itemCount: 1,
      });
    } else {
      // 收入 — 檢查是否跟上一筆屬於同一組
      if (currentGroup && (currentGroup.startTime - tx.createdAt) < 60000) {
        // 同一組（時間差 < 60 秒）
        currentGroup.txs.push(tx);
        currentGroup.totalAmount += tx.amount;
        currentGroup.startTime = tx.createdAt; // 更新為最新的
        // 從 note 解析數量（格式：「商品名 x數量」或「商品名」）
        const qtyMatch = tx.note?.match(/x(\d+)$/);
        currentGroup.itemCount += qtyMatch ? parseInt(qtyMatch[1]) : 1;
      } else {
        // 新的一組
        if (currentGroup) groups.push(currentGroup);
        const qtyMatch = tx.note?.match(/x(\d+)$/);
        currentGroup = {
          id: `group_${tx.createdAt}`,
          type: "single",
          txs: [tx],
          totalAmount: tx.amount,
          startTime: tx.createdAt,
          itemCount: qtyMatch ? parseInt(qtyMatch[1]) : 1,
        };
      }
    }
  });
  if (currentGroup) groups.push(currentGroup);

  // 如果一組裡有多筆，標記為 order
  groups.forEach((g) => { if (g.txs.length > 1) g.type = "order"; });

  return groups;
}

// 取得訂單組的商品摘要文字（小字顯示用）
// 例：「手作餅乾、咖啡、果醬」或「手作餅乾 x2、咖啡」
export function getOrderSummary(group: TxGroup): string {
  if (group.type === "single") {
    const tx = group.txs[0];
    // 從 note 取商品名（去掉 x數量 後綴）
    return tx.note?.replace(/ x\d+$/, "") || tx.category;
  }
  // 多筆訂單 — 取每筆的商品名
  const names = group.txs.map((tx) => {
    return tx.note?.replace(/ x\d+$/, "") || tx.category;
  });
  // 去重並保留順序
  const unique = [...new Set(names)];
  if (unique.length <= 3) return unique.join("、");
  return `${unique.slice(0, 3).join("、")} 等${unique.length}項`;
}
