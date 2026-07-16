#!/bin/bash
# 建構後處理：把 index.html 中的絕對路徑改成相對路徑
# 這樣 file:// 協議才能正確載入資源

set -e

OUT_DIR="/home/z/my-project/out"
HTML_FILE="$OUT_DIR/index.html"

if [ ! -f "$HTML_FILE" ]; then
  echo "✗ index.html 不存在"
  exit 1
fi

echo "=== 處理 index.html 中的路徑 ==="

# 把 /_next/ → ./_next/
# 把 /logo.png → ./logo.png
# 把 /logo.svg → ./logo.svg
# 把 /robots.txt → ./robots.txt
# 保留 // 開頭的（如 https://）
sed -i \
  -e 's|href="/_next/|href="./_next/|g' \
  -e 's|src="/_next/|src="./_next/|g' \
  -e 's|href="/logo\.|href="./logo.|g' \
  -e 's|src="/logo\.|src="./logo.|g' \
  -e 's|"/robots\.txt"|"./robots.txt"|g' \
  -e 's|"/favicon\.ico"|"./favicon.ico"|g' \
  "$HTML_FILE"

echo "=== 檢查結果 ==="
echo "絕對路徑 /_next/ 剩餘: $(grep -c '/_next/' "$HTML_FILE" || echo 0)"
echo "相對路徑 ./_next/ 數量: $(grep -c '\./_next/' "$HTML_FILE" || echo 0)"

echo "=== 複製到 Android assets ==="
rm -rf /home/z/my-project/android/app/src/main/assets/public
mkdir -p /home/z/my-project/android/app/src/main/assets/public
cp -r "$OUT_DIR"/* /home/z/my-project/android/app/src/main/assets/public/

echo "=== 完成 ==="
