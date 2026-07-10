/**
 * 免費會員匯出功能
 *
 * - 只匯出當日交易記錄
 * - 格式：CSV / TSV
 * - 欄位：日期、商品名稱、分類、金額、備註
 * - 日期格式：YYYY-MM-DD
 * - 金額：兩位小數
 * - 按日期降序排列（最新在最上方）
 * - 儲存到 Downloads 目錄（用 Capacitor Filesystem）
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
  // 用 labelKey 從 i18n 取得翻譯
  const labelKey = info.labelKey as keyof Translations;
  return (t[labelKey] as string) || info.label;
}

/**
 * 跳脫 CSV 欄位（包含逗號、引號、換行要用引號包住）
 */
function escapeCSVField(value: string, separator: string): string {
  if (!value) return "";
  // 如果包含 separator、引號、或換行，用引號包住並跳脫內部引號
  if (value.includes(separator) || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 產生匯出內容
 */
export function generateExportContent({ transactions, products, format, t }: ExportOptions): string {
  const todayTx = getTodayTransactions(transactions);

  // 按日期降序排列（最新在最上方）
  const sorted = [...todayTx].sort((a, b) => b.createdAt - a.createdAt);

  const separator = format === "csv" ? "," : "\t";
  const headers = [
    t.export_header_date,
    t.export_header_product,
    t.export_header_category,
    t.export_header_amount,
    t.export_header_note,
  ];

  // UTF-8 BOM（避免 Excel 開啟亂碼）
  const BOM = "\uFEFF";

  // 表頭
  const headerLine = headers.map((h) => escapeCSVField(h, separator)).join(separator);

  // 資料行
  const dataLines = sorted.map((tx) => {
    const fields = [
      formatDate(tx.createdAt),
      getProductName(tx, products),
      getCategoryLabel(tx.category, t),
      formatAmount(tx.amount),
      tx.note || "",
    ];
    return fields.map((f) => escapeCSVField(f, separator)).join(separator);
  });

  return BOM + headerLine + "\n" + dataLines.join("\n");
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
 * 匯出到 Downloads 目錄（用 Capacitor Filesystem）
 * 返回成功/失敗訊息
 */
export async function exportToFilesystem(
  content: string,
  filename: string
): Promise<{ success: boolean; message: string; path?: string }> {
  try {
    // 動態載入 Capacitor Filesystem
    const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
    const { Capacitor } = await import("@capacitor/core");

    if (!Capacitor.isNativePlatform()) {
      // 網頁環境 — 用 Blob 下載
      return exportToWeb(content, filename);
    }

    // 原生環境 — 用 Filesystem 寫入 Downloads
    const result = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    return {
      success: true,
      message: `已匯出到: ${result.uri}`,
      path: result.uri,
    };
  } catch (e) {
    console.error("[Export] Filesystem 匯出失敗:", e);
    // fallback 到 web 下載
    return exportToWeb(content, filename);
  }
}

/**
 * 網頁環境下載（Blob）
 */
async function exportToWeb(content: string, filename: string): Promise<{ success: boolean; message: string }> {
  try {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true, message: `已下載: ${filename}` };
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
): Promise<{ success: boolean; message: string }> {
  const todayTx = getTodayTransactions(transactions);

  if (todayTx.length === 0) {
    return { success: false, message: t.export_no_data };
  }

  const content = generateExportContent({ transactions, products, format, t });
  const filename = getExportFilename(format);
  const result = await exportToFilesystem(content, filename);

  return {
    success: result.success,
    message: result.success
      ? `${t.export_success} (${todayTx.length} ${t.export_records})`
      : result.message,
  };
}
