/**
 * 免費會員匯出功能
 *
 * - 只匯出當日交易記錄
 * - 格式：CSV / TSV
 * - 欄位：日期、單號、商品名稱、數量、分類、金額、備註
 * - 單號用 1, 2, 3... 序號（按時間順序，同一 orderId = 同一單）
 * - 日期格式：YYYY-MM-DD
 * - 金額：兩位小數
 * - 按日期降序排列（最新在最上方）
 * - 最後加總數量和總金額
 * - 儲存到 Documents 目錄（用 Capacitor Filesystem）
 * - 加入 UTF-8 BOM 避免 Excel 開啟亂碼
 */

import type { Transaction, Product, CategoryId } from "@/lib/store";
import { getCategoryInfo } from "@/lib/store";
import type { Translations } from "@/lib/i18n";

export type ExportFormat = "csv" | "tsv";

interface ExportOptions {
  transactions: Transaction[];
  products: Product[];
  format: ExportFormat;
  t: Translations;
}

export interface ExportResult {
  success: boolean;
  message: string;
  path?: string;
  filename?: string;
  count?: number;
  totalAmount?: number;
}

/**
 * 取得當日交易
 */
function getTodayTransactions(transactions: Transaction[]): Transaction[] {
  const today = new Date().toDateString();
  return transactions.filter((tx) => new Date(tx.createdAt).toDateString() === today);
}

/**
 * 格式化日期為 YYYY-MM-DD
 */
function formatDate(ts: number): string {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 格式化金額為兩位小數
 */
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * 取得商品名稱
 */
function getProductName(tx: Transaction, products: Product[]): string {
  if (!tx.productId) return "";
  const product = products.find((p) => p.id === tx.productId);
  return product?.name || "";
}

/**
 * 取得分類的本地化標籤
 */
function getCategoryLabel(category: CategoryId, t: Translations): string {
  const info = getCategoryInfo(category);
  if (!info) return "";
  const labelKey = info.labelKey as keyof Translations;
  return (t[labelKey] as string) || info.label;
}

/**
 * 跳脫 CSV 欄位
 */
function escapeCSVField(value: string, separator: string): string {
  if (!value) return "";
  if (value.includes(separator) || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 產生匯出內容（含單號分組、數量、總金額）
 *
 * 單號邏輯：
 * - 同一個 orderId = 同一單
 * - 按時間順序編號 1, 2, 3...
 * - 沒有 orderId 的交易各別為獨立的單
 */
export function generateExportContent({ transactions, products, format, t }: ExportOptions): {
  content: string;
  count: number;
  totalAmount: number;
} {
  const todayTx = getTodayTransactions(transactions);
  // 按日期降序排列（最新在最上方）
  const sorted = [...todayTx].sort((a, b) => b.createdAt - a.createdAt);

  // 建立 orderId → 單號映射（按最早出現順序編號）
  const orderMap = new Map<string, number>();
  let orderCounter = 1;
  // 先按時間正序建立映射（讓最早的單是 1）
  const chronological = [...sorted].sort((a, b) => a.createdAt - b.createdAt);
  for (const tx of chronological) {
    const key = tx.orderId || `solo_${tx.id}`; // 沒有 orderId 的用 tx.id 作為獨立 key
    if (!orderMap.has(key)) {
      orderMap.set(key, orderCounter++);
    }
  }

  const separator = format === "csv" ? "," : "\t";
  const headers = [
    t.export_header_date,
    t.export_header_order,
    t.export_header_product,
    t.export_header_qty,
    t.export_header_category,
    t.export_header_amount,
    t.export_header_note,
  ];

  const BOM = "\uFEFF";
  const headerLine = headers.map((h) => escapeCSVField(h, separator)).join(separator);

  const dataLines = sorted.map((tx) => {
    const key = tx.orderId || `solo_${tx.id}`;
    const orderNum = orderMap.get(key) || 0;
    const fields = [
      formatDate(tx.createdAt),
      String(orderNum),
      getProductName(tx, products),
      String(tx.qty || 1),
      getCategoryLabel(tx.category, t),
      formatAmount(tx.amount),
      tx.note || "", // 備註只用用戶輸入的，空就留白
    ];
    return fields.map((f) => escapeCSVField(f, separator)).join(separator);
  });

  // 計算總數量和總金額
  const totalQty = sorted.reduce((sum, tx) => sum + (tx.qty || 1), 0);
  const totalAmount = sorted.reduce((sum, tx) => sum + tx.amount, 0);
  const count = sorted.length;

  // 加入合計行
  const summaryLine = [
    "",
    t.export_summary_count + ": " + totalQty,
    "",
    "",
    "",
    t.export_summary_total + ": " + formatAmount(totalAmount),
    "",
  ].map((f) => escapeCSVField(f, separator)).join(separator);

  const content = BOM + headerLine + "\n" + dataLines.join("\n") + "\n" + summaryLine;

  return { content, count, totalAmount };
}

/**
 * 取得匯出檔名
 */
export function getExportFilename(format: ExportFormat): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `marketledger_${yyyy}${mm}${dd}.${format}`;
}

/**
 * 匯出到 Documents 目錄
 */
export async function exportToFilesystem(
  content: string,
  filename: string
): Promise<{ success: boolean; message: string; path?: string }> {
  try {
    const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
    const { Capacitor } = await import("@capacitor/core");

    if (!Capacitor.isNativePlatform()) {
      return exportToWeb(content, filename);
    }

    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    return {
      success: true,
      message: t_export_saved_to + result.uri,
      path: result.uri,
    };
  } catch (e) {
    console.error("[Export] Filesystem 匯出失敗:", e);
    return exportToWeb(content, filename);
  }
}

// 暫存 i18n（避免循環依賴）
let t_export_saved_to = "已匯出到: ";
export function setExportI18n(savedTo: string) {
  t_export_saved_to = savedTo;
}

/**
 * 網頁環境下載
 */
async function exportToWeb(content: string, filename: string): Promise<{ success: boolean; message: string; path?: string }> {
  try {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true, message: `已下載: ${filename}`, path: filename };
  } catch (e) {
    return { success: false, message: `匯出失敗: ${e}` };
  }
}

/**
 * 完整匯出流程
 */
export async function exportTodayData(
  transactions: Transaction[],
  products: Product[],
  format: ExportFormat,
  t: Translations
): Promise<ExportResult> {
  const todayTx = getTodayTransactions(transactions);

  if (todayTx.length === 0) {
    return { success: false, message: t.export_no_data };
  }

  setExportI18n(t.export_saved_to);

  const { content, count, totalAmount } = generateExportContent({ transactions, products, format, t });
  const filename = getExportFilename(format);
  const result = await exportToFilesystem(content, filename);

  return {
    success: result.success,
    message: result.success ? t.export_success : result.message,
    path: result.path,
    filename,
    count,
    totalAmount,
  };
}

/**
 * 打開已匯出的檔案
 * 用 Capacitor Filesystem.openFile（Android 會用系統的檔案檢視器打開）
 */
export async function openExportedFile(path: string, t: Translations): Promise<{ success: boolean; message: string }> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) {
      return { success: false, message: t.export_open_web_only };
    }

    const { Filesystem, Directory } = await import("@capacitor/filesystem");

    // path 可能是 file:///data/user/0/.../files/marketledger_20260710.csv
    // 或只是檔名 marketledger_20260710.csv
    let filename = path;
    if (path.includes("/")) {
      filename = path.split("/").pop() || path;
    }

    // 用 Filesystem.openFile 讓系統用合適的 app 打開
    try {
      await Filesystem.openFile({
        path: filename,
        directory: Directory.Documents,
      });
      return { success: true, message: t.export_opening };
    } catch (e1) {
      console.error("[Export] openFile 失敗:", e1);
      // fallback: 用 getUri + Browser
      try {
        const uriResult = await Filesystem.getUri({
          path: filename,
          directory: Directory.Documents,
        });
        console.log("[Export] 檔案 URI:", uriResult.uri);
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: uriResult.uri });
        return { success: true, message: t.export_opening };
      } catch (e2) {
        console.error("[Export] getUri+Browser 也失敗:", e2);
        return { success: false, message: t.export_open_failed + ": " + (e2 as Error).message };
      }
    }
  } catch (e) {
    console.error("[Export] openExportedFile 例外:", e);
    return { success: false, message: t.export_open_failed + ": " + e };
  }
}
