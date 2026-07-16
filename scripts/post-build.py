#!/usr/bin/env python3
"""
建構後處理：
1. 把 _next 目錄重命名為 next（Android aapt 會排除 _ 開頭的目錄）
2. 把所有檔案中的 _next 路徑改成 next
3. 把絕對路徑改成相對路徑
4. 修正 turbopack runtime chunk 的路徑前綴
"""
import re
import sys
import shutil
from pathlib import Path

OUT_DIR = Path("/home/z/my-project/out")
ANDROID_ASSETS = Path("/home/z/my-project/android/app/src/main/assets/public")

if not (OUT_DIR / "index.html").exists():
    print("✗ index.html 不存在")
    sys.exit(1)

print("=== 1. 重命名 _next → next ===")
next_dir = OUT_DIR / "_next"
if next_dir.exists():
    # 如果目標已存在，先刪除
    target = OUT_DIR / "next"
    if target.exists():
        shutil.rmtree(target)
    next_dir.rename(target)
    print(f"  ✓ _next → next")

# 也重命名 _not-found
nf_dir = OUT_DIR / "_not-found"
if nf_dir.exists():
    target = OUT_DIR / "not-found"
    if target.exists():
        shutil.rmtree(target)
    nf_dir.rename(target)
    print(f"  ✓ _not-found → not-found")

print("\n=== 2. 處理所有檔案中的路徑 ===")
# 處理 index.html
html_file = OUT_DIR / "index.html"
content = html_file.read_text(encoding="utf-8")
# 把 _next 改成 next，絕對路徑改成相對路徑
content = content.replace('"./_next/', '"./next/').replace('"/_next/', '"./next/')
content = content.replace('"/_next/', '"./next/')
content = content.replace('"./_next/', '"./next/')
content = content.replace('"/logo.', '"./logo.')
content = content.replace('"/robots.txt', '"./robots.txt')
content = content.replace('"/favicon.ico', '"./favicon.ico')
# 任何殘留的 /_next/ 也改成 ./next/
content = content.replace('/_next/', './next/')
html_file.write_text(content, encoding="utf-8")
print(f"  ✓ index.html 路徑已更新")

# 處理所有 JS chunks
chunks_dir = OUT_DIR / "next" / "static" / "chunks"
if chunks_dir.exists():
    for js_file in chunks_dir.glob("*.js"):
        js_content = js_file.read_text(encoding="utf-8")
        original = js_content
        # 把所有 /_next/ 替換成 /next/（包括路徑解析、URL 構建等）
        js_content = js_content.replace('/_next/', '/next/')
        # 把 "/next/" 字串值改成 "./next/"（用於動態載入的相對路徑）
        js_content = js_content.replace('"/next/"', '"./next/"')
        # let t="./next/"
        js_content = re.sub(r'(let\s+t\s*=\s*)"/next/"', r'\1"./next/"', js_content)
        if js_content != original:
            js_file.write_text(js_content, encoding="utf-8")
            print(f"  ✓ {js_file.name} 已更新")

# 處理所有 HTML 檔案（包括 _not-found.html 等）
for html_file in OUT_DIR.rglob("*.html"):
    c = html_file.read_text(encoding="utf-8")
    c = c.replace('/_next/', './next/').replace('"./_next/', '"./next/')
    html_file.write_text(c, encoding="utf-8")

print("\n=== 3. 驗證 ===")
# 檢查是否還有殘留的 _next
remaining = 0
for f in OUT_DIR.rglob("*"):
    if f.is_file() and f.suffix in ['.html', '.js', '.css', '.json']:
        c = f.read_text(encoding="utf-8", errors="ignore")
        if '/_next/' in c or '"./_next/' in c:
            remaining += 1
            print(f"  ⚠️ {f.relative_to(OUT_DIR)} 還有 _next 引用")
if remaining == 0:
    print("  ✓ 所有 _next 引用已清除")

print("\n=== 4. 複製到 Android assets ===")
if ANDROID_ASSETS.exists():
    shutil.rmtree(ANDROID_ASSETS)
ANDROID_ASSETS.mkdir(parents=True, exist_ok=True)
for item in OUT_DIR.iterdir():
    if item.is_dir():
        shutil.copytree(item, ANDROID_ASSETS / item.name)
    else:
        shutil.copy2(item, ANDROID_ASSETS / item.name)

# 確認沒有 _ 開頭的目錄
for item in ANDROID_ASSETS.iterdir():
    if item.is_dir() and item.name.startswith('_'):
        print(f"  ⚠️ 還有 _ 開頭的目錄: {item.name}")

total = sum(f.stat().st_size for f in ANDROID_ASSETS.rglob('*') if f.is_file())
js_count = len(list((ANDROID_ASSETS / "next" / "static" / "chunks").glob("*.js")))
print(f"  ✓ Android assets 大小: {total} bytes")
print(f"  ✓ JS chunks 數量: {js_count}")
print("=== 完成 ===")
