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
 * 用 transform + position:fixed 避免卡頓：
 * - transform 動畫由 GPU 合成，不觸發 reflow
 * - position:fixed 不佔佈局空間，隱藏時不留空白
 * - 內容區域用 padding-top 補償 Top Bar 高度
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
  const BAR_HEIGHT = 45;

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
    <>
      {/* Top Bar — position:fixed 不佔佈局空間 */}
      <div
        className="fixed top-0 left-0 right-0 z-30 transition-transform duration-200 ease-out"
        style={{
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          willChange: "transform",
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

      {/* 佔位元素 — 讓內容不被 Top Bar 遮擋 */}
      <div style={{ height: `${BAR_HEIGHT}px` }} className="flex-shrink-0" />
    </>
  );
}
