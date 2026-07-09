"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TopBarProps {
  /** Logo 圖片 URL */
  logoSrc?: string;
  /** App 名稱 */
  appName?: string;
  /** 當前頁面標題 */
  title?: string;
  /** 當前頁面圖示 */
  icon?: LucideIcon;
  /** 用戶頭像 URL */
  userPicture?: string;
  /** 點擊帳號按鈕 */
  onAccountClick?: () => void;
  /** 滾動容器的 ref（用於監聽滾動） */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * 頂部導航欄 — 帶滾動隱藏/顯示動效
 *
 * 行為：
 * - 往上滑（瀏覽內容）→ Top Bar 平滑隱藏（往上移出）
 * - 往下滑 → Top Bar 立刻平滑顯示（往下彈回）
 * - 動畫 250ms ease-in-out
 */
export function TopBar({
  logoSrc = "/logo.png",
  appName = "市集記賬本",
  title,
  icon: Icon,
  userPicture,
  onAccountClick,
  scrollContainerRef,
}: TopBarProps) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (ticking.current) return;
    ticking.current = true;

    requestAnimationFrame(() => {
      const container = scrollContainerRef?.current;
      if (!container) {
        ticking.current = false;
        return;
      }

      const currentScrollY = container.scrollTop;
      const delta = currentScrollY - lastScrollY.current;

      // 在頂部時永遠顯示
      if (currentScrollY <= 10) {
        setVisible(true);
      } else if (delta > 2) {
        // 往下滑 → 顯示
        setVisible(true);
      } else if (delta < -2) {
        // 往上滑 → 隱藏
        setVisible(false);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    });
  }, [scrollContainerRef]);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll, scrollContainerRef]);

  return (
    <div
      className="flex-shrink-0 z-20 overflow-hidden transition-transform duration-250 ease-in-out"
      style={{
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
    >
      <div className="relative bg-gradient-to-r from-primary via-primary to-primary/95 text-primary-foreground">
        {/* 背景裝飾光暈 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/8 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-20 h-8 bg-accent/5 rounded-full blur-xl pointer-events-none" />

        {/* 主體內容 */}
        <div className="relative flex items-center justify-between px-4 h-12">
          {/* 左側：Logo + 標題 */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0 border border-accent/20 overflow-hidden">
              {logoSrc ? (
                <img src={logoSrc} alt={appName} className="w-7 h-7 object-contain" />
              ) : (
                <span className="text-accent font-bold text-sm">ML</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              {Icon && (
                <Icon className="w-3.5 h-3.5 text-accent/80 flex-shrink-0" strokeWidth={2.2} />
              )}
              <h1 className="text-sm font-bold text-primary-foreground/95 truncate">
                {title || appName}
              </h1>
            </div>
          </div>

          {/* 右側：帳號按鈕 */}
          <button
            onClick={onAccountClick}
            className="relative w-8 h-8 rounded-full bg-accent/15 hover:bg-accent/25 flex items-center justify-center border border-accent/20 transition-all active:scale-95 flex-shrink-0"
            aria-label="帳號"
          >
            {userPicture ? (
              <img src={userPicture} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-accent" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* 底部香檳金細線 */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      </div>
    </div>
  );
}
