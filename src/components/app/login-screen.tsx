"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, Lock, Eye, EyeOff, Store } from "lucide-react";

export function LoginScreen() {
  const { testLogin } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("請輸入帳號和密碼");
      return;
    }

    setLoading(true);
    // 模擬一點延遲，避免暴力破解太快
    await new Promise((r) => setTimeout(r, 350));
    try {
      const ok = await testLogin(username, password);
      if (!ok) {
        setError("帳號或密碼錯誤");
        setPassword("");
        setLoading(false);
      }
      // 成功的話 testAuthed=true，page.tsx 會自動切換到主畫面
    } catch {
      setError("登入失敗，請重試");
      setLoading(false);
    }
  };

  if (!mounted) {
    return <div className="w-full h-full bg-background" />;
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/30">
      {/* Top decorative gradient */}
      <div className="relative flex-shrink-0 pt-12 pb-8 px-6">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-primary/8 via-accent/5 to-transparent pointer-events-none" />
        <div className="relative flex flex-col items-center">
          {/* Logo icon */}
          <img src="/logo.png" alt="市集記賬本" className="w-16 h-16 shadow-lg mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">市集記賬本</h1>
          <p className="text-xs text-muted-foreground mt-1 tracking-wide">MarketLedger · 測試版</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 flex flex-col justify-center">
        <Card className="p-5 space-y-4 shadow-sm">
          <div>
            <h2 className="text-base font-semibold text-foreground">登入測試帳號</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">僅限持有測試帳號的使用者使用</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Username */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">帳號</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="輸入帳號"
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="bg-background pl-9 h-11 text-sm"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-medium text-muted-foreground mb-1 block">密碼</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="輸入密碼"
                  className="bg-background pl-9 pr-9 h-11 text-sm"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-[11px] text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold"
            >
              {loading ? "驗證中..." : "登入"}
            </Button>
          </form>
        </Card>

        <p className="text-[10px] text-muted-foreground/60 text-center mt-6 px-4 leading-relaxed">
          本應用程式為測試版本，僅供受邀測試者使用。
          <br />
         未經授權請勿散布。
        </p>
      </div>
    </div>
  );
}
