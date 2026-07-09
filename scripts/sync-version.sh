#!/bin/bash
# 版本號同步腳本
# 從 src/lib/version.ts 讀取版本號，自動同步到 android/app/build.gradle
# 用法：bash scripts/sync-version.sh [new_version]
#   不帶參數：只同步現有版本號到 build.gradle
#   帶參數：先更新 version.ts，再同步到 build.gradle

set -e

PROJECT_DIR="/home/z/my-project"
VERSION_FILE="$PROJECT_DIR/src/lib/version.ts"

# 如果帶參數，先更新 version.ts
if [ -n "$1" ]; then
  NEW_VERSION="$1"
  # 確保格式為 vX.Y.Z-test
  if [[ ! "$NEW_VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+-test$ ]]; then
    echo "❌ 版本格式錯誤，應為 vX.Y.Z-test（例如 v0.9.3-test）"
    exit 1
  fi
  
  # 計算 versionCode: major*10000 + minor*100 + patch
  VERSION_NUM="${NEW_VERSION#v}"  # 移除 v
  VERSION_NUM="${VERSION_NUM%-test}"  # 移除 -test
  MAJOR=$(echo "$VERSION_NUM" | cut -d. -f1)
  MINOR=$(echo "$VERSION_NUM" | cut -d. -f2)
  PATCH=$(echo "$VERSION_NUM" | cut -d. -f3)
  VERSION_CODE=$((MAJOR * 10000 + MINOR * 100 + PATCH))
  
  # 顯示名稱：v0.9.3 (測試版)
  DISPLAY_VERSION="${NEW_VERSION%-test} (測試版)"
  
  echo "📝 更新 version.ts..."
  cat > "$VERSION_FILE" << EOF
// App 版本常數 — 用於檢查 GitHub Release 是否有新版可更新
// 格式必須跟 GitHub Release tag 一致：vX.Y.Z-xxx
export const APP_VERSION = "${NEW_VERSION}";
export const APP_VERSION_DISPLAY = "${DISPLAY_VERSION}";

// GitHub repo 資訊
export const GITHUB_REPO = "artifexhongkong/marketledger";
// 注意：/releases/latest 只回傳非 prerelease 的最新版，會 404
// 我們的測試版都是 prerelease，所以改用 /releases 取第一筆（最新）
export const GITHUB_RELEASES_API = \`https://api.github.com/repos/\${GITHUB_REPO}/releases?per_page=10\`;
export const GITHUB_RELEASES_PAGE = \`https://github.com/\${GITHUB_REPO}/releases\`;

// 簡單的版本比較：回傳 1 代表 a 較新、-1 代表 b 較新、0 代表相同
// 支援格式：v0.3.0-test、v0.3.0、0.3.0
export function compareVersions(a: string, b: string): number {
  const normalize = (v: string) => v.replace(/^v/i, "").toLowerCase();
  const parseVersion = (v: string) => {
    const m = normalize(v).match(/^(\\d+)\\.(\\d+)\\.(\\d+)(?:[-.](\\w+))?/);
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
EOF
  echo "   APP_VERSION = $NEW_VERSION"
  echo "   versionCode = $VERSION_CODE"
else
  # 從 version.ts 讀取現有版本
  NEW_VERSION=$(grep 'APP_VERSION' "$VERSION_FILE" | head -1 | sed 's/.*"\(v[^"]*\)".*/\1/')
  VERSION_NUM="${NEW_VERSION#v}"
  VERSION_NUM="${VERSION_NUM%-test}"
  MAJOR=$(echo "$VERSION_NUM" | cut -d. -f1)
  MINOR=$(echo "$VERSION_NUM" | cut -d. -f2)
  PATCH=$(echo "$VERSION_NUM" | cut -d. -f3)
  VERSION_CODE=$((MAJOR * 10000 + MINOR * 100 + PATCH))
  VERSION_NAME="${NEW_VERSION#v}"
fi

echo ""
echo "✅ 版本號同步完成"
echo "   APP_VERSION: $NEW_VERSION"
echo "   versionName: $VERSION_NAME"
echo "   versionCode: $VERSION_CODE"
echo ""
echo "使用方式："
echo "  同步現有版本：bash scripts/sync-version.sh"
echo "  設定新版本：  bash scripts/sync-version.sh v1.0.0-test"
