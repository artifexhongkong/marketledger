#!/usr/bin/env python3
"""
從 public/logo.png 生成 Android launcher icons
尺寸：
- mipmap-mdpi:   48x48
- mipmap-hdpi:   72x72
- mipmap-xhdpi:  96x96
- mipmap-xxhdpi: 144x144
- mipmap-xxxhdpi: 192x192
foreground:
- mipmap-mdpi:   108x108
- mipmap-hdpi:   162x162
- mipmap-xhdpi:  216x216
- mipmap-xxhdpi: 324x324
- mipmap-xxxhdpi: 432x432
"""
from PIL import Image, ImageDraw
from pathlib import Path
import shutil

LOGO_PATH = Path("/home/z/my-project/public/logo.png")
RES_DIR = Path("/home/z/my-project/android/app/src/main/res")

# 標準 launcher icon 尺寸
SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

# adaptive icon foreground 尺寸（比 launcher 大 2.25x）
FOREGROUND_SIZES = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
}

print("=== 載入 logo ===")
logo = Image.open(LOGO_PATH).convert("RGBA")
print(f"  原始尺寸: {logo.size}")

# 為了讓 logo 在 adaptive icon 中有 padding（安全區域是中間 66%），
# foreground 要把 logo 放在中間 70% 區域
def create_launcher_icon(size):
    """方形 launcher icon — logo 填滿整個圖"""
    # 先建立一個正方形 canvas，把 logo 居中縮放填滿
    resized = logo.resize((size, size), Image.LANCZOS)
    return resized

def create_round_icon(size):
    """圓形 launcher icon — logo 在中央，周圍透明"""
    # 建立透明 canvas
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # logo 縮放到 size
    resized = logo.resize((size, size), Image.LANCZOS)
    # 用圓形 mask
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse([0, 0, size-1, size-1], fill=255)
    canvas.paste(resized, (0, 0), mask)
    return canvas

def create_foreground(size):
    """adaptive icon foreground — logo 居中佔 70%，周圍留白"""
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # logo 佔 70%
    logo_size = int(size * 0.72)
    resized = logo.resize((logo_size, logo_size), Image.LANCZOS)
    # 居中
    offset = ((size - logo_size) // 2, (size - logo_size) // 2)
    canvas.paste(resized, offset, resized)
    return canvas

print("\n=== 生成 launcher icons ===")
for mipmap_dir, size in SIZES.items():
    target_dir = RES_DIR / mipmap_dir
    target_dir.mkdir(parents=True, exist_ok=True)
    
    # ic_launcher.png
    launcher = create_launcher_icon(size)
    launcher.save(target_dir / "ic_launcher.png", "PNG")
    
    # ic_launcher_round.png
    round_icon = create_round_icon(size)
    round_icon.save(target_dir / "ic_launcher_round.png", "PNG")
    
    print(f"  {mipmap_dir}: {size}x{size} ✓")

print("\n=== 生成 foreground icons ===")
for mipmap_dir, size in FOREGROUND_SIZES.items():
    target_dir = RES_DIR / mipmap_dir
    target_dir.mkdir(parents=True, exist_ok=True)
    
    fg = create_foreground(size)
    fg.save(target_dir / "ic_launcher_foreground.png", "PNG")
    
    print(f"  {mipmap_dir}: {size}x{size} ✓")

# 也複製到 assets/android-icons（給 git 追蹤用）
print("\n=== 複製到 assets/android-icons ===")
ASSETS_DIR = Path("/home/z/my-project/assets/android-icons")
for mipmap_dir, size in SIZES.items():
    src = RES_DIR / mipmap_dir
    dst = ASSETS_DIR / mipmap_dir
    dst.mkdir(parents=True, exist_ok=True)
    for name in ["ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png"]:
        shutil.copy2(src / name, dst / name)
    print(f"  {mipmap_dir} ✓")

print("\n=== 完成 ===")
