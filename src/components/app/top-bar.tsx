"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TopBarProps {
  logoSrc?: string;
  appName?: string;
  title?: string;
  icon?: LucideIcon;
  userPicture?: string;
  onAccountClick?: () => void;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * 頂部導航欄 — 帶滾動隱藏/顯示動效
 *
 * 行為：
 * - 往上滑（手指往下滑，內容往下走）→ Top Bar 立刻顯示
 * - 往下滑（手指往上滑，內容往上走）→ Top Bar 隱藏
 * - 250ms ease-in-out
 *
 * 實現方式：用 margin-top 負值 + height 動畫
 * 不用 transform（transform 不影響佈局，會留空白）
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
  const BAR_HEIGHT = 45; // h-11 = 44px + 1px border

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

      if (currentScrollY <= 10) {
        setVisible(true);
      } else if (delta < -2) {
        // scrollTop 減少 = 手指往下滑 = 往上滑 → 顯示
        setVisible(true);
      } else if (delta > 2) {
        // scrollTop 增加 = 手指往上滑 = 往下滑 → 隱藏
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
      className="overflow-hidden transition-all duration-250 ease-in-out flex-shrink-0"
      style={{
        height: visible ? `${BAR_HEIGHT}px` : "0px",
        marginTop: visible ? "0px" : `-${BAR_HEIGHT}px`,
        transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
    >
      <div className="relative bg-background/95 backdrop-blur-md">
        {/* 主體內容 */}
        <div className="relative flex items-center justify-between px-4 h-11">
          {/* 左側：Logo + 標題 */}
          <div className="flex items-center gap-2 min-w-0">
            <img src={logoSrc} alt={appName} className="h-8 w-8 object-contain flex-shrink-0" />

            <div className="flex items-center gap-1 min-w-0">
              {Icon && (
                <Icon className="w-3.5 h-3.5 text-accent/80 flex-shrink-0" strokeWidth={2.2} />
              )}
              <h1 className="text-sm font-bold text-foreground truncate">
                {title || appName}
              </h1>
            </div>
          </div>

          {/* 右側：帳號按鈕 */}
          <button
            onClick={onAccountClick}
            className="relative w-8 h-8 rounded-full bg-accent/10 hover:bg-accent/20 flex items-center justify-center border border-accent/15 transition-all active:scale-95 flex-shrink-0"
            aria-label="帳號"
          >
            {userPicture ? (
              <img src={userPicture} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-accent" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* 底部細線 */}
        <div className="h-px bg-border/50" />
      </div>
    </div>
  );
}
