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
 * 頂部導航欄 — 滾動隱藏/顯示動效
 *
 * 方案：整個 Top Bar 容器用 height 動畫收縮
 * - overflow:hidden 容器包裹內容
 * - 隱藏時 height 從完整高度收縮到 0
 * - 內容用 transform 輔助滑出（GPU合成）
 * - 不留背板、不留空白
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

      if (currentScrollY <= 10) {
        setVisible(true);
      } else if (delta < -2) {
        setVisible(true);
      } else if (delta > 2) {
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
      className="flex-shrink-0 overflow-hidden z-20"
      style={{
        // 高度動畫：顯示時 auto（用 max-height 模擬），隱藏時 0
        maxHeight: visible ? "80px" : "0px",
        transition: "max-height 200ms cubic-bezier(0.25, 0.1, 0.25, 1)",
        paddingTop: "var(--safe-area-top, 0px)",
      }}
    >
      <div className="bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 h-11">
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
          <button
            onClick={onAccountClick}
            className="w-8 h-8 rounded-full bg-accent/10 hover:bg-accent/20 flex items-center justify-center border border-accent/15 transition-all active:scale-95 flex-shrink-0"
            aria-label="帳號"
          >
            {userPicture ? (
              <img src={userPicture} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-accent" strokeWidth={2} />
            )}
          </button>
        </div>
        <div className="h-px bg-border/50" />
      </div>
    </div>
  );
}
