"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
}

interface AuthState {
  user: GoogleUser | null;
  accessToken: string | null;
  // 儲存模式：local（本地 localStorage）或 drive（Google Drive）
  storageMode: "local" | "drive";
  setUser: (user: GoogleUser | null) => void;
  setAccessToken: (token: string | null) => void;
  setStorageMode: (mode: "local" | "drive") => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      storageMode: "local",

      setUser: (user) => set({ user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setStorageMode: (storageMode) => set({ storageMode }),

      signOut: () => set({ user: null, accessToken: null, storageMode: "local" }),
    }),
    {
      name: "marketledger-auth",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : (undefined as any))),
    }
  )
);
