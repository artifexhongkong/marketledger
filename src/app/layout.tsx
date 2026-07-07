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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 在 client 端透過 useEffect 切換 dark class
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `try{var d=JSON.parse(localStorage.getItem('marketledger-preview')||'{}');if(d.state&&d.state.darkMode){document.documentElement.classList.add('dark');}}catch(e){}`
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
