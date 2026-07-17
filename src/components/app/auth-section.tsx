"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, CloudOff, LogOut, Database, Upload, Download, AlertCircle, ChevronLeft, Shield, Zap, Crown, Check, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";
import { MembershipCard } from "@/components/app/membership-card";

const WEB_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const ANDROID_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata openid email profile";

// 偵測是否在 Capacitor 原生環境
const isNative = typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();

export function AuthPage({ onBack }: { onBack: () => void }) {
  const t = useT();
  const { user, accessToken, storageMode, setUser, setAccessToken, setStorageMode, signOut } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [authProgress, setAuthProgress] = useState<string>("");

  // 從 access_token 取得使用者資訊
  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const info = await res.json();
      if (info.email) {
        setUser({ email: info.email, name: info.name || info.email, picture: info.picture || "", sub: info.sub || "" });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // ========== Google 登入 ==========

  const handleLogin = async () => {
    // Native 環境不需要 WEB_GOOGLE_CLIENT_ID（用 GoogleAuthPlugin 的 WEB_CLIENT_ID）
    if (!isNative && !WEB_GOOGLE_CLIENT_ID) { setError(t.auth_no_client_id); return; }

    setLoading(true);
    setError(null);
    setAuthProgress(t.auth_loading);

    try {
      if (isNative) {
        await nativeGoogleLogin();
      } else {
        await webGoogleLogin();
      }
    } catch (e: any) {
      setError(e?.message || t.auth_login_failed);
    } finally {
      setLoading(false);
      setAuthProgress("");
    }
  };

  // --- 網頁版登入：GIS Token Client ---
  const webGoogleLogin = async () => {
    // 確保 GIS 已載入
    if (!(window as any).google?.accounts?.oauth2) {
      await loadGISScript();
    }

    if (!(window as any).google?.accounts?.oauth2) {
      throw new Error(t.auth_google_not_loaded);
    }

    return new Promise<void>((resolve, reject) => {
      try {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: WEB_GOOGLE_CLIENT_ID,
          scope: SCOPES,
          callback: async (response: any) => {
            if (response.error) {
              reject(new Error(response.error_description || t.auth_login_failed));
              return;
            }
            const token = response.access_token;
            setAccessToken(token);
            const ok = await fetchUserInfo(token);
            if (!ok) reject(new Error(t.auth_login_failed));
            else resolve();
          },
        });
        tokenClient.requestAccessToken();
      } catch (e) {
        reject(e);
      }
    });
  };

  // --- Android 原生登入：Capacitor GoogleAuth Plugin（Credential Manager API） ---
  const nativeGoogleLogin = async () => {
    setAuthProgress(t.auth_loading);

    const { Capacitor, registerPlugin } = await import("@capacitor/core");

    // 取得 GoogleAuth plugin
    let GoogleAuth = (Capacitor as any).Plugins?.GoogleAuth;
    if (!GoogleAuth) {
      try {
        GoogleAuth = registerPlugin("GoogleAuth");
      } catch {
        GoogleAuth = (Capacitor as any).Plugins?.GoogleAuth;
      }
    }

    if (!GoogleAuth) {
      throw new Error("GoogleAuth plugin 未載入");
    }

    // 加入 15 秒超時保護，防止 promise 永遠掛起
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("登入超時，請重試")), 15000);
    });

    const signInPromise = GoogleAuth.signIn();

    let result;
    try {
      result = await Promise.race([signInPromise, timeoutPromise]);
    } catch (e: any) {
      throw new Error(e?.message || "登入失敗");
    }

    if (!result || result.success === false) {
      throw new Error(result?.error || t.auth_login_failed);
    }

    const user = result.user;
    if (!user || !user.email) {
      throw new Error(t.auth_login_failed);
    }

    setAccessToken(user.idToken || "native-token");
    setUser({
      email: user.email,
      name: user.name || user.email,
      picture: user.picture || "",
      sub: "",
    });
  };

  // 載入 GIS script
  const loadGISScript = (): Promise<void> => {
    return new Promise((resolve) => {
      if ((window as any).google?.accounts?.oauth2) { resolve(); return; }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = () => {
        // 等待 google.accounts.oauth2 初始化
        let tries = 0;
        const check = setInterval(() => {
          if ((window as any).google?.accounts?.oauth2) {
            clearInterval(check);
            resolve();
          } else if (tries++ > 20) {
            clearInterval(check);
            resolve();
          }
        }, 100);
      };
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2 && accessToken) {
      (window as any).google.accounts.oauth2.revoke(accessToken, () => {});
    }
    signOut();
  };

  // ========== 未登入頁面 ==========
  if (!user) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header — 與主App一致的背景色 */}
        <div className="bg-background/95 backdrop-blur-md flex-shrink-0 border-b border-border/40">
          <div className="relative flex items-center px-3 h-11">
            <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-95">
              <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col">
          {/* Logo + 標題 */}
          <div className="text-center space-y-4 mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mx-auto shadow-lg">
              <Shield className="w-10 h-10 text-accent" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t.auth_title}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto mt-2">
                {t.auth_desc}
              </p>
            </div>
          </div>

          {/* 功能亮點 */}
          <div className="space-y-2.5 mb-8">
            {[
              { icon: Cloud, text: t.auth_cloud_desc },
              { icon: Shield, text: t.auth_local_desc },
              { icon: Zap, text: t.membership_feature_multi_device },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/40">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-xs text-foreground font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Google 登入按鈕 */}
          <div className="mt-auto space-y-3">
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 bg-white border-2 border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300 font-semibold rounded-2xl shadow-sm transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {authProgress || t.auth_loading}
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t.auth_google_login}
                </span>
              )}
            </Button>

            {error && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========== 已登入頁面 ==========
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header — 與主App一致 */}
      <div className="bg-background/95 backdrop-blur-md flex-shrink-0 border-b border-border/40" style={{ paddingTop: "var(--safe-area-top, 0px)" }}>
        <div className="relative flex items-center justify-between px-3 h-11">
          <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-95">
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <button onClick={handleSignOut} className="flex items-center gap-1 text-rose-500 hover:text-rose-600 transition-colors px-2 py-1 rounded-lg active:scale-95">
            <LogOut className="w-4 h-4" />
            <span className="text-xs font-medium">{t.settings_logout}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* 用戶資訊卡片 */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 px-4 py-5 flex items-center gap-4">
            {user.picture ? (
              <img src={user.picture} alt="" className="w-16 h-16 rounded-full border-2 border-accent/30 shadow-md" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center border-2 border-accent/30">
                <span className="text-xl font-bold text-accent">{user.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </Card>

        {/* 會員方案 */}
        <MembershipCard />

        {/* 儲存模式 */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">{t.auth_storage}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setStorageMode("local")}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition ${storageMode === "local" ? "border-accent bg-accent/5" : "border-border bg-card hover:border-accent/30"}`}>
              <CloudOff className={`w-5 h-5 ${storageMode === "local" ? "text-accent" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${storageMode === "local" ? "text-accent" : "text-foreground"}`}>{t.auth_local}</span>
            </button>
            <button onClick={() => setStorageMode("drive")}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition ${storageMode === "drive" ? "border-accent bg-accent/5" : "border-border bg-card hover:border-accent/30"}`}>
              <Cloud className={`w-5 h-5 ${storageMode === "drive" ? "text-accent" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${storageMode === "drive" ? "text-accent" : "text-foreground"}`}>{t.auth_cloud}</span>
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {storageMode === "local" ? t.auth_local_desc : t.auth_cloud_desc}
          </p>
        </Card>

        {/* 雲端操作 */}
        {storageMode === "drive" && accessToken && (
          <CloudBackupButtons accessToken={accessToken} onStatus={setBackupStatus} />
        )}
        {backupStatus && <p className="text-xs text-muted-foreground text-center">{backupStatus}</p>}
      </div>
    </div>
  );
}

function CloudBackupButtons({ accessToken, onStatus }: { accessToken: string; onStatus: (s: string) => void }) {
  const t = useT();
  const { transactions, products, markets, currentMarketId, currency, clearAll, addTransaction } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true); onStatus(t.auth_uploading);
    const { backupToDrive } = await import("@/lib/drive-service");
    const result = await backupToDrive(accessToken, { transactions, products, markets, currentMarketId, currency });
    setLoading(false);
    onStatus(result.success ? t.auth_backup_done : `✗ ${result.error}`);
  };

  const handleRestore = async () => {
    if (!confirm(t.auth_restore_confirm)) return;
    setLoading(true); onStatus(t.auth_restoring);
    const { restoreFromDrive } = await import("@/lib/drive-service");
    const result = await restoreFromDrive(accessToken);
    if (result.success && result.data) {
      const data = result.data as any;
      if (data.transactions) { clearAll(); data.transactions.forEach((tx: any) => addTransaction(tx)); }
      onStatus(t.auth_restore_done);
    } else { onStatus(`✗ ${result.error}`); }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button onClick={handleBackup} disabled={loading} variant="outline" className="h-10 text-xs">
        <Upload className="w-3.5 h-3.5 mr-1.5" />{t.auth_backup}
      </Button>
      <Button onClick={handleRestore} disabled={loading} variant="outline" className="h-10 text-xs">
        <Download className="w-3.5 h-3.5 mr-1.5" />{t.auth_restore}
      </Button>
    </div>
  );
}
