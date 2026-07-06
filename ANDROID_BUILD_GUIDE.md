# 市集記賬本 — Android APK 打包指南

## 環境準備

- **Node.js** v18+
- **JDK 21**（含 `javac`，不是隻有 JRE）
- **Android SDK** Platform 34 + Build-tools 34.0.0 + platform-tools

## 打包步驟

### 1. 安裝依賴

```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### 2. 切換到靜態匯出模式

`next.config.ts` 改成：

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
};
export default nextConfig;
```

### 3. 確認沒有會擋靜態匯出的 route

如果有 `src/app/api/route.ts` 之類的 API route，刪除它（靜態匯出不支援）。

### 4. 建置網頁

```bash
npx next build
# 確認 out/ 目錄生成
```

### 5. 加入 Android 平台（首次）

```bash
npx cap add android
npx cap sync android
```

### 6. 用 Gradle 直接建置 APK（免 Android Studio）

```bash
export ANDROID_HOME=/path/to/android-sdk
export JAVA_HOME=/path/to/jdk-21
cd android
chmod +x gradlew
./gradlew assembleDebug --no-daemon
```

APK 路徑：`android/app/build/outputs/apk/debug/app-debug.apk`

### 7. 建置完成後

把 `next.config.ts` 切回 `output: "standalone"`，避免影響開發伺服器。

### 8. 發布到 GitHub Releases

```bash
# 建立 release
curl -X POST -H "Authorization: token <PAT>" \
  https://api.github.com/repos/<owner>/<repo>/releases \
  -d '{"tag_name":"vX.Y.Z-test","target_commitish":"<sha>","name":"...","body":"...","prerelease":true}'

# 上傳 APK
curl -X POST -H "Authorization: token <PAT>" \
  -H "Content-Type: application/vnd.android.package-archive" \
  --data-binary @app-debug.apk \
  "https://uploads.github.com/repos/<owner>/<repo>/releases/<id>/assets?name=marketledger-debug.apk"
```

## 注意事項

- App 內建版本檢查：`src/lib/version.ts` 的 `APP_VERSION` 必須跟 Release tag 一致
- 版本比較用 `compareVersions()` 函數，支援 `vX.Y.Z-xxx` 格式
- 升級覆蓋安裝不會清空 localStorage 資料
- 解除安裝會清空所有資料
- Google 登入需要額外設定 Android OAuth Client ID
- Gradle daemon 在低記憶體環境可能崩潰，加 `--no-daemon -Xmx2048m` 比較穩
