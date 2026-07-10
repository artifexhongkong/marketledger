// App 版本常數 — 用於檢查 GitHub Release 是否有新版可更新
// 格式必須跟 GitHub Release tag 一致：vX.Y.Z-xxx
export const APP_VERSION = "v1.1.20-test";
export const APP_VERSION_DISPLAY = "v1.1.20 (測試版)";

// GitHub repo 資訊
export const GITHUB_REPO = "artifexhongkong/marketledger";
// 注意：/releases/latest 只回傳非 prerelease 的最新版，會 404
// 我們的測試版都是 prerelease，所以改用 /releases 取第一筆（最新）
export const GITHUB_RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10`;
export const GITHUB_RELEASES_PAGE = `https://github.com/${GITHUB_REPO}/releases`;

// 簡單的版本比較：回傳 1 代表 a 較新、-1 代表 b 較新、0 代表相同
// 支援格式：v0.3.0-test、v0.3.0、0.3.0
export function compareVersions(a: string, b: string): number {
  const normalize = (v: string) => v.replace(/^v/i, "").toLowerCase();
  const parseVersion = (v: string) => {
    const m = normalize(v).match(/^(\d+)\.(\d+)\.(\d+)(?:[-.](\w+))?/);
    if (!m) return [0, 0, 0, ""];
    return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), m[4] || ""];
  };
  const [aMaj, aMin, aPat, aPre] = parseVersion(a);
  const [bMaj, bMin, bPat, bPre] = parseVersion(b);
  if (aMaj !== bMaj) return aMaj > bMaj ? 1 : -1;
  if (aMin !== bMin) return aMin > bMin ? 1 : -1;
  if (aPat !== bPat) return aPat > bPat ? 1 : -1;
  // 預發布版本（pre-release）比正式版舊
  if (aPre && !bPre) return -1;
  if (!aPre && bPre) return 1;
  if (aPre && bPre) return aPre > bPre ? 1 : aPre < bPre ? -1 : 0;
  return 0;
}
