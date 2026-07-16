"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";

export function GoogleSetupGuide() {
  const [copied, setCopied] = useState(false);

  const copyClientId = () => {
    navigator.clipboard.writeText("NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的_client_id.apps.googleusercontent.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Badge className="bg-amber-100 text-amber-800 border-0">設定說明</Badge>
        <h3 className="text-sm font-semibold text-foreground">Google OAuth 設定步驟</h3>
      </div>

      <ol className="space-y-2.5 text-xs text-muted-foreground leading-relaxed">
        <li className="flex gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">1</span>
          <span>
            前往{" "}
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-0.5">
              Google Cloud Console <ExternalLink className="w-3 h-3" />
            </a>
            ，登入 Google 帳號
          </span>
        </li>
        <li className="flex gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">2</span>
          <span>建立新專案（或選擇現有專案）</span>
        </li>
        <li className="flex gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">3</span>
          <span>到「APIs &amp; Services → Library」，啟用 <strong>Google Drive API</strong></span>
        </li>
        <li className="flex gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">4</span>
          <span>到「OAuth consent screen」設定 App 名稱為 <code className="bg-muted px-1 rounded">MarketLedger</code>，使用者類型選「外部」</span>
        </li>
        <li className="flex gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">5</span>
          <span>到「Credentials → Create Credentials → OAuth client ID」，類型選 <strong>Web application</strong></span>
        </li>
        <li className="flex gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">6</span>
          <span>
            「Authorized JavaScript origins」加入你的網域，例如：
            <br />
            <code className="bg-muted px-1 rounded text-[10px]">https://preview-chat-b482cc26-b74f-42b6-bc0b-bed12a7e1d16.space-z.ai</code>
            <br />
            <code className="bg-muted px-1 rounded text-[10px]">http://localhost:3000</code>
          </span>
        </li>
        <li className="flex gap-2">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">7</span>
          <span>
            建立後複製 Client ID，在專案根目錄建立 <code className="bg-muted px-1 rounded">.env.local</code> 檔案：
          </span>
        </li>
      </ol>

      <div className="bg-muted rounded-lg p-3 relative">
        <code className="text-xs text-foreground break-all">
          NEXT_PUBLIC_GOOGLE_CLIENT_ID=你的_client_id.apps.googleusercontent.com
        </code>
        <button
          onClick={copyClientId}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
          aria-label="複製"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        設定完成後重啟開發伺服器即可使用 Google 登入與雲端備份。
      </p>
    </Card>
  );
}
