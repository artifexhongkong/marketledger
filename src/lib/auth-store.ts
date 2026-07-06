"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
}

// 測試帳號清單（之後可擴充多帳號）
const TEST_ACCOUNTS: Record<string, string> = {
  chl2o2: "45f8cf2f521b260f6366ea42b6ca0df6af147f50416027ccf63ca2a6af53bb6a",
};

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

  // 測試帳號登入/登出
  testLogin: (username: string, password: string) => boolean;
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

      testLogin: (username, password) => {
        const u = username.trim().toLowerCase();
        if (TEST_ACCOUNTS[u] && TEST_ACCOUNTS[u] === password) {
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
