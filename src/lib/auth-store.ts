"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
}

// 測試帳號清單 — 只存 SHA-256 hash，不存明文密碼
// 這樣即使 source code 外洩也看不到原始密碼
const TEST_ACCOUNTS: Record<string, string> = {
  chl2o2: "45f8cf2f521b260f6366ea42b6ca0df6af147f50416027ccf63ca2a6af53bb6a",
};

// SHA-256 hash helper（用 Web Crypto API）
async function sha256(text: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    // fallback（不應該發生在現代瀏覽器/WebView）
    return "";
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface AuthState {
  user: GoogleUser | null;
  accessToken: string | null;
  // 儲存模式：local（本地 localStorage）或 drive（Google Drive）
  storageMode: "local" | "drive";

  // 測試帳號登入狀態
  testAuthed: boolean;
  testUsername: string | null;
  testLoginAt: number | null;

  setUser: (user: GoogleUser | null) => void;
  setAccessToken: (token: string | null) => void;
  setStorageMode: (mode: "local" | "drive") => void;
  signOut: () => void;

  // 測試帳號登入/登出（hash 驗證，async）
  testLogin: (username: string, password: string) => Promise<boolean>;
  testLogout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      storageMode: "local",
      testAuthed: false,
      testUsername: null,
      testLoginAt: null,

      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setStorageMode: (storageMode) => set({ storageMode }),

      signOut: () => set({ user: null, accessToken: null, storageMode: "local" }),

      testLogin: async (username, password) => {
        const u = username.trim().toLowerCase();
        const storedHash = TEST_ACCOUNTS[u];
        if (!storedHash) return false;
        // 計算輸入密碼的 hash 並比對
        const inputHash = await sha256(password);
        if (!inputHash) return false;
        if (storedHash === inputHash) {
          set({ testAuthed: true, testUsername: u, testLoginAt: Date.now() });
          return true;
        }
        return false;
      },

      testLogout: () => set({ testAuthed: false, testUsername: null, testLoginAt: null }),
    }),
    {
      name: "marketledger-auth",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as any))),
    }
  )
);
