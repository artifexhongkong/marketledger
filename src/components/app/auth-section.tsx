"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, CloudOff, LogOut, Database, Upload, Download, AlertCircle } from "lucide-react";

// ⚠️ 重要：你需要設定 Google OAuth Client ID
// 請到 https://console.cloud.google.com/apis/credentials 建立一個 OAuth 2.0 Client ID
// 類型選「Web application」，Authorized JavaScript origins 加入你的網域
// 然後把 Client ID 填入下方變數，或設為環境變數 NEXT_PUBLIC_GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

// Google OAuth scope：appDataFolder 讓 App 可在用戶 Drive 中存放隱藏資料
const SCOPES = [
  "https://www.googleapis.com/auth/drive.appdata",
  "openid",
  "email",
  "profile",
].join(" ");

export function AuthSection() {
  const { user, accessToken, storageMode, setUser, setAccessToken, setStorageMode, signOut } = useAuthStore();
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  // 載入 Google Identity Services
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).google?.accounts?.oauth2) {
      setGoogleLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => setGoogleLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleLogin = async () => {
    if (!googleLoaded) {
      setError("Google 服務尚未載入，請稍候再試");
      return;
    }
    if (!GOOGLE_CLIENT_ID) {
      setError("未設定 Google Client ID。請見下方設定說明。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: async (response: any) => {
          if (response.error) {
            setError(response.error_description || "登入失敗");
            setLoading(false);
            return;
          }

          const token = response.access_token;
          setAccessToken(token);

          // 取得用戶資訊
          try {
            const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const userInfo = await userInfoRes.json();
            setUser({
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
              sub: userInfo.sub,
            });
          } catch {
            // 即使取不到用戶資訊，token 仍可用於 Drive
            setUser({
              email: "(已登入)",
              name: "Google 用戶",
              picture: "",
              sub: "",
            });
          }

          setLoading(false);
        },
      });
      tokenClient.requestAccessToken();
    } catch (e) {
      setError(e instanceof Error ? e.message : "登入失敗");
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
      // 撤銷 token
      if (accessToken) {
        (window as any).google.accounts.oauth2.revoke(accessToken, () => {});
      }
    }
    signOut();
  };

  if (!user) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <CloudOff className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">雲端帳號</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          登入 Google 帳號後，可將資料備份到 Google Drive，跨裝置同步。
        </p>
        <Button
          onClick={handleLogin}
          disabled={loading || !googleLoaded}
          className="w-full h-10 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {loading ? (
            "登入中..."
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              使用 Google 登入
            </>
          )}
        </Button>
        {error && (
          <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
        {!GOOGLE_CLIENT_ID && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800 font-medium mb-1">⚠️ 需要設定 Google Client ID</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              請見下方「Google OAuth 設定說明」，設定後才能使用 Google 登入與雲端備份。
            </p>
          </div>
        )}
      </Card>
    );
  }

  // 已登入狀態
  return (
    <Card className="p-4 space-y-3">
      {/* 用戶資訊 */}
      <div className="flex items-center gap-3">
        {user.picture ? (
          <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            {user.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
          aria-label="登出"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* 儲存模式選擇 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-xs font-medium text-foreground">資料儲存位置</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setStorageMode("local")}
            className={`flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition ${
              storageMode === "local"
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <CloudOff className={`w-5 h-5 ${storageMode === "local" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs font-medium ${storageMode === "local" ? "text-primary" : "text-foreground"}`}>
              本機儲存
            </span>
          </button>
          <button
            onClick={() => setStorageMode("drive")}
            className={`flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition ${
              storageMode === "drive"
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <Cloud className={`w-5 h-5 ${storageMode === "drive" ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-xs font-medium ${storageMode === "drive" ? "text-primary" : "text-foreground"}`}>
              Google Drive
            </span>
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {storageMode === "local"
            ? "資料只存在這台裝置，清除瀏覽器資料會消失"
            : "資料同步到 Google Drive（appDataFolder，隱藏不佔空間），可跨裝置存取"}
        </p>
      </div>

      {/* 雲端操作按鈕 */}
      {storageMode === "drive" && accessToken && (
        <CloudBackupButtons accessToken={accessToken} onStatus={setBackupStatus} />
      )}

      {backupStatus && (
        <p className="text-xs text-muted-foreground text-center">{backupStatus}</p>
      )}
    </Card>
  );
}

// ── 雲端備份/還原按鈕 ──
function CloudBackupButtons({
  accessToken,
  onStatus,
}: {
  accessToken: string;
  onStatus: (s: string) => void;
}) {
  const { transactions, products, markets, currentMarketId, currency } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    onStatus("正在上傳備份...");
    const { backupToDrive } = await import("@/lib/drive-service");
    const result = await backupToDrive(accessToken, {
      transactions,
      products,
      markets,
      currentMarketId,
      currency,
    });
    setLoading(false);
    onStatus(result.success ? "✓ 已備份到 Google Drive" : `✗ ${result.error}`);
  };

  const handleRestore = async () => {
    if (!confirm("還原會覆蓋目前所有資料，確定嗎？")) return;
    setLoading(true);
    onStatus("正在從雲端還原...");
    const { restoreFromDrive } = await import("@/lib/drive-service");
    const result = await restoreFromDrive(accessToken);
    if (result.success && result.data) {
      const data = result.data as any;
      // 還原資料到 store（需要從主 store 匯入 setter）
      const store = useAppStore.getState();
      if (data.transactions) {
        // 清除現有資料再還原
        store.clearAll();
        data.transactions.forEach((t: any) => store.addTransaction(t));
      }
      onStatus("✓ 已從 Google Drive 還原");
    } else {
      onStatus(`✗ ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        onClick={handleBackup}
        disabled={loading}
        variant="outline"
        className="h-9 text-xs"
      >
        <Upload className="w-3.5 h-3.5 mr-1.5" />
        備份到雲端
      </Button>
      <Button
        onClick={handleRestore}
        disabled={loading}
        variant="outline"
        className="h-9 text-xs"
      >
        <Download className="w-3.5 h-3.5 mr-1.5" />
        從雲端還原
      </Button>
    </div>
  );
}

// 需要匯入 useAppStore 來存取交易資料
import { useAppStore } from "@/lib/store";
