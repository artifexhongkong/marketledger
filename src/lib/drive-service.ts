"use client";

/**
 * Google Drive 雲端備份服務（瀏覽器端，用 fetch 直接呼叫 Drive REST API）
 *
 * 不使用 googleapis Node.js 套件，改用 fetch + access_token
 * 因為 googleapis 依賴 Node.js 的 https 模組，無法在瀏覽器運行
 */

const BACKUP_FILENAME = "marketledger-backup.json";
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

/**
 * 列出 appDataFolder 中的備份檔案
 */
async function listBackupFiles(accessToken: string): Promise<{ id: string; modifiedTime?: string } | null> {
  const url = new URL(`${DRIVE_API}/files`);
  url.searchParams.set("spaces", "appDataFolder");
  url.searchParams.set("q", `name = '${BACKUP_FILENAME}'`);
  url.searchParams.set("fields", "files(id, name, modifiedTime)");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Drive API 錯誤 (${res.status})`);
  }

  const data = await res.json();
  return data.files?.[0] || null;
}

/**
 * 上傳備份到 Google Drive（appDataFolder）
 */
export async function backupToDrive(
  accessToken: string,
  data: unknown
): Promise<{ success: boolean; error?: string }> {
  try {
    const content = JSON.stringify({
      version: "1.0",
      exportedAt: new Date().toISOString(),
      data,
    });

    const existing = await listBackupFiles(accessToken);

    if (existing) {
      // 更新現有檔案（用 multipart upload）
      const boundary = "marketledger" + Date.now();
      const body = `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify({}) + "\r\n" +
        `--${boundary}\r\n` +
        `Content-Type: application/json\r\n\r\n` +
        content + "\r\n" +
        `--${boundary}--`;

      const res = await fetch(
        `${DRIVE_UPLOAD_API}/files/${existing.id}?uploadType=multipart`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `更新失敗 (${res.status})`);
      }
    } else {
      // 建立新檔案
      const boundary = "marketledger" + Date.now();
      const metadata = {
        name: BACKUP_FILENAME,
        parents: ["appDataFolder"],
      };
      const body = `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(metadata) + "\r\n" +
        `--${boundary}\r\n` +
        `Content-Type: application/json\r\n\r\n` +
        content + "\r\n" +
        `--${boundary}--`;

      const res = await fetch(
        `${DRIVE_UPLOAD_API}/files?uploadType=multipart`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `建立失敗 (${res.status})`);
      }
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * 從 Google Drive 下載備份
 */
export async function restoreFromDrive(
  accessToken: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const file = await listBackupFiles(accessToken);
    if (!file) {
      return { success: false, error: "雲端沒有備份檔案" };
    }

    const res = await fetch(`${DRIVE_API}/files/${file.id}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `下載失敗 (${res.status})`);
    }

    const text = await res.text();
    const parsed = JSON.parse(text);
    return { success: true, data: parsed.data };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * 取得雲端備份資訊（最後修改時間）
 */
export async function getDriveBackupInfo(
  accessToken: string
): Promise<{ success: boolean; modifiedTime?: string; error?: string }> {
  try {
    const file = await listBackupFiles(accessToken);
    if (!file) {
      return { success: false, error: "沒有備份" };
    }
    return { success: true, modifiedTime: file.modifiedTime };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
