import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { useAppStore } from "@/lib/store";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "市集記賬本",
  description: "全球市集攤商的隨身營業助理 · 3 秒記一筆 · 收攤即結算",
  keywords: ["市集", "記帳", "攤商", "香港", "全球"],
  authors: [{ name: "ArtifexStudio" }],
  viewport: { width: "device-width", initialScale: 1, viewportFit: "cover" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 在 client 端透過 useEffect 切換 dark class + 設定 safe-area
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              var d = JSON.parse(localStorage.getItem('marketledger-preview') || '{}');
              if (d.state && d.state.darkMode) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}

            // Safe Area Fallback for Android
            // env(safe-area-inset-top) 在某些 Android WebView 回傳 0
            // 用 JavaScript 檢測並設定 fallback 值
            function setSafeArea() {
              var top = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-top').trim();
              // 如果 env() 回傳 0px 或空值，用固定值 24px（Android status bar 高度）
              if (!top || top === '0px') {
                // 檢測是否為 Capacitor Android 環境
                if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
                  document.documentElement.style.setProperty('--safe-area-top', '24px');
                }
              }
            }
            setSafeArea();
            window.addEventListener('load', setSafeArea);
          `
        }} />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
