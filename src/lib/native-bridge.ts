/**
 * Native Bridge — JavaScript 與 Android 原生層的橋接
 *
 * 取代 Capacitor，直接透過 @JavascriptInterface 與 Kotlin 通訊
 *
 * 使用方式：
 *   import { nativeSignIn, isNative, openExternalUrl } from "@/lib/native-bridge";
 */

// 偵測是否在原生 Android 環境
export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as any).AndroidInterface?.isNative?.();
}

// ── Google Sign-In 橋接 ──
// 原生端透過 window.__handleGoogleSignInResult(jsonStr) 回傳結果

interface SignInResult {
  success: boolean;
  user?: {
    email: string;
    name: string;
    picture: string;
    idToken: string;
  };
  error?: string;
}

let signInPromise: { resolve: (r: SignInResult) => void; reject: (e: Error) => void } | null = null;

// 設定全域回調（原生端會呼叫這個函數）
if (typeof window !== "undefined") {
  (window as any).__handleGoogleSignInResult = function (jsonStr: string) {
    try {
      const result: SignInResult = JSON.parse(jsonStr);
      if (signInPromise) {
        signInPromise.resolve(result);
        signInPromise = null;
      }
    } catch (e) {
      if (signInPromise) {
        signInPromise.reject(new Error("解析登入結果失敗: " + e));
        signInPromise = null;
      }
    }
  };
}

/**
 * Google 登入
 * 呼叫原生 Credential Manager API
 */
export function nativeSignIn(): Promise<SignInResult> {
  return new Promise((resolve, reject) => {
    if (!isNative()) {
      reject(new Error("不在原生環境中"));
      return;
    }

    // 15 秒超時保護
    const timeout = setTimeout(() => {
      if (signInPromise) {
        signInPromise.reject(new Error("登入超時，請重試"));
        signInPromise = null;
      }
    }, 15000);

    signInPromise = {
      resolve: (r) => {
        clearTimeout(timeout);
        resolve(r);
      },
      reject: (e) => {
        clearTimeout(timeout);
        reject(e);
      },
    };

    try {
      (window as any).AndroidInterface._signIn();
    } catch (e) {
      clearTimeout(timeout);
      signInPromise = null;
      reject(new Error("呼叫原生登入失敗: " + e));
    }
  });
}

// ── 開啟外部 URL ──
export function openExternalUrl(url: string): void {
  if (typeof window === "undefined") return;
  if (isNative()) {
    try {
      (window as any).AndroidInterface.openUrl(url);
    } catch {
      window.open(url, "_blank");
    }
  } else {
    window.open(url, "_blank");
  }
}

// ── 取得 App 版本 ──
export function getNativeAppVersion(): string | null {
  if (typeof window === "undefined") return null;
  if (!isNative()) return null;
  try {
    return (window as any).AndroidInterface.getAppVersion();
  } catch {
    return null;
  }
}
