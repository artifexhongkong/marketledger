"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, CloudOff, LogOut, Database, Upload, Download, AlertCircle, ChevronLeft } from "lucide-react";
import { useT } from "@/lib/i18n";

const WEB_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const ANDROID_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "";
const SCOPES = "https://www.googleapis.com/auth/drive.appdata openid email profile";
// Android OAuth 回調用的自訂 URL scheme
const ANDROID_REDIRECT_URI = "com.artifexstudio.marketledger://oauth";

// 偵測是否在 Capacitor Android WebView 環境
const isCapacitorAndroid = typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();

export function AuthPage({ onBack }: { onBack: () => void }) {
  const t = useT();
  const { user, accessToken, storageMode, setUser, setAccessToken, setStorageMode, signOut } = useAuthStore();
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).google?.accounts?.oauth2) { setGoogleLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => setGoogleLoaded(true);
    document.head.appendChild(script);
  }, []);

  // 處理從 access_token 取得使用者資訊的共用函數
  const fetchUserInfo = async (token: string) => {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const info = await res.json();
      setUser({ email: info.email, name: info.name, picture: info.picture, sub: info.sub });
    } catch {
      setUser({ email: t.auth_logged_in, name: t.auth_google_user, picture: "", sub: "" });
    }
  };

  // Android 環境：監聽 appUrlOpen 事件接收 OAuth 回調
  useEffect(() => {
    if (!isCapacitorAndroid) return;

    let listener: any;
    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        listener = await App.addListener("appUrlOpen", async (data: any) => {
          const url: string = data.url || "";
          // 解析 URL 中的 access_token
          if (url.includes("access_token=")) {
            const tokenMatch = url.match(/access_token=([^&]+)/);
            if (tokenMatch) {
              const token = decodeURIComponent(tokenMatch[1]);
              setAccessToken(token);
              await fetchUserInfo(token);
              setLoading(false);
              // 關閉系統瀏覽器
              try {
                const { Browser } = await import("@capacitor/browser");
                await Browser.close();
              } catch {}
            }
          } else if (url.includes("error=")) {
            const errorMatch = url.match(/error=([^&]+)/);
            setError(errorMatch ? decodeURIComponent(errorMatch[1]) : t.auth_login_failed);
            setLoading(false);
          }
        });
      } catch (e) {
        // App plugin 載入失敗，靜默處理
      }
    })();

    return () => {
      if (listener?.remove) listener.remove();
    };
  }, []);

  const handleLogin = async () => {
    // 根據環境選擇正確的 Client ID
    const clientId = isCapacitorAndroid ? ANDROID_GOOGLE_CLIENT_ID : WEB_GOOGLE_CLIENT_ID;
    if (!clientId) { setError(t.auth_no_client_id); return; }

    // Android WebView 環境：用系統瀏覽器 OAuth + 自訂 URL scheme 回調
    if (isCapacitorAndroid) {
      setLoading(true); setError(null);
      try {
        const authUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
          `client_id=${clientId}` +
          `&redirect_uri=${encodeURIComponent(ANDROID_REDIRECT_URI)}` +
          `&response_type=token` +
          `&scope=${encodeURIComponent(SCOPES)}` +
          `&include_granted_scopes=true` +
          `&prompt=consent`;

        // 用 Capacitor Browser 開啟系統瀏覽器
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: authUrl });
        // 等待 appUrlOpen 事件回調（在上面的 useEffect 處理）
      } catch (e) {
        setError(e instanceof Error ? e.message : t.auth_login_failed);
        setLoading(false);
      }
      return;
    }

    // 網頁環境：使用 GIS Token Client（正常流程）
    if (!googleLoaded) { setError(t.auth_google_not_loaded); return; }
    setLoading(true); setError(null);
    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId, scope: SCOPES,
        callback: async (response: any) => {
          if (response.error) { setError(response.error_description || t.auth_login_failed); setLoading(false); return; }
          const token = response.access_token;
          setAccessToken(token);
          await fetchUserInfo(token);
          setLoading(false);
        },
      });
      tokenClient.requestAccessToken();
    } catch (e) { setError(e instanceof Error ? e.message : t.auth_login_failed); setLoading(false); }
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2 && accessToken) {
      (window as any).google.accounts.oauth2.revoke(accessToken, () => {});
    }
    signOut();
  };

  if (!user) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/8 rounded-full blur-2xl" />
          <div className="relative flex items-center px-4 h-14">
            <button onClick={onBack} className="flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">{t.common_back}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center mx-auto">
              <CloudOff className="w-8 h-8 text-accent" />
            </div>
            <h1 className="text-xl font-bold text-foreground">{t.auth_title}</h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              {t.auth_desc}
            </p>
          </div>

          <Button onClick={handleLogin} disabled={loading}
            className="w-full max-w-xs h-11 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium">
            {loading ? t.auth_loading : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <p className="text-xs text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>
          )}
        </div>
      </div>
    );
  }

  // 已登入
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground relative overflow-hidden flex-shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/8 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-between px-4 h-14">
          <button onClick={onBack} className="flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground">
            <ChevronLeft className="w-5 h-5" /><span className="text-sm">{t.common_back}</span>
          </button>
          <button onClick={handleSignOut} className="p-1.5 text-primary-foreground/60 hover:text-primary-foreground">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {/* 用戶資訊 */}
        <div className="flex flex-col items-center gap-3">
          {user.picture ? (
            <img src={user.picture} alt="" className="w-20 h-20 rounded-full border-2 border-accent/30 shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center border-2 border-accent/30">
              <span className="text-2xl font-bold text-accent">{user.name.charAt(0)}</span>
            </div>
          )}
          <div className="text-center">
            <p className="text-base font-bold text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

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
