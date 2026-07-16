export default function RNAppPage() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white">MarketLedger · React Native Web 版</h1>
        <p className="text-sm text-slate-400 mt-1">
          這是完整的 RN App（用 React Native Web 編譯），在手機瀏覽器打開即可測試真實 App 邏輯
        </p>
        <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-emerald-900/40 text-emerald-300 text-xs rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          真實 App 邏輯 · 觸控手勢支援 · 震動回饋（手機）
        </div>
      </div>

      {/* 手機框架 */}
      <div className="relative w-full max-w-[400px]">
        <div className="relative bg-slate-800 rounded-[2.5rem] p-2.5 shadow-2xl">
          {/* 螢幕 */}
          <div className="bg-white rounded-[2rem] overflow-hidden" style={{ height: '750px' }}>
            <iframe
              src="/marketledger-app/index.html"
              className="w-full h-full border-0"
              title="MarketLedger RN App"
              allow="vibration"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-4 text-center max-w-md">
        💡 在手機上用瀏覽器打開此頁面，即可體驗完整 App（含長按手勢調數量、Toast 撤銷等）
      </p>

      <div className="mt-3 flex gap-3 text-xs">
        <a
          href="/marketledger-app/index.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 underline"
        >
          全螢幕開啟 →
        </a>
        <a
          href="/"
          className="text-slate-400 hover:text-slate-300 underline"
        >
          返回網頁預覽版
        </a>
      </div>
    </main>
  );
}
