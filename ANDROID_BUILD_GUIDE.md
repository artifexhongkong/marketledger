# 市集記賬本 — Android APK 打包指南

## 環境準備

1. 安裝 [Node.js](https://nodejs.org) (v18+)
2. 安裝 [Android Studio](https://developer.android.com/studio)
3. 安裝 Java JDK 17

## 打包步驟

### 1. 解壓專案
```bash
unzip MarketLedger-web-latest.zip
cd web-clean
```

### 2. 安裝依賴
```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 3. 初始化 Capacitor
```bash
npx cap init "市集記賬本" "com.artifexstudio.marketledger" --web-dir=out
```

### 4. 切換到靜態匯出模式
```bash
# 備份原本的 next.config
mv next.config.mjs next.config.mjs.bak
# 使用靜態匯出版本
cp next.config.capacitor.js next.config.mjs
```

### 5. 建置網頁
```bash
npm run build
```

### 6. 加入 Android 平台
```bash
npx cap add android
npx cap sync
```

### 7. 用 Android Studio 打開
```bash
npx cap open android
```

### 8. 在 Android Studio 中建置 APK
- 選單 Build → Build Bundle(s)/APK(s) → Build APK(s)
- 完成後在 `android/app/build/outputs/apk/debug/` 找到 `app-debug.apk`

### 9. 安裝到手機
- 把 `.apk` 傳到手機
- 手機設定 → 安全性 → 允許「未知來源」
- 點擊 `.apk` 安裝

## 注意事項
- `next.config.capacitor.js` 是給 Capacitor 用的靜態匯出設定
- 開發時用原本的 `next.config.mjs`（不要用靜態匯出）
- 打包前才切換到 `next.config.capacitor.js`
- Google 登入功能需要設定 Android 的 OAuth Client ID（在 Google Cloud Console 中加入 Android 平台）
