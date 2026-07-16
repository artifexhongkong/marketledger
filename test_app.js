const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_DIR = '/home/z/my-project/out';

const MIME = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
};

function getMime(p) {
  for (const [ext, mime] of Object.entries(MIME)) {
    if (p.endsWith(ext)) return mime;
  }
  return 'application/octet-stream';
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  
  // 攔截所有請求，從 out/ 目錄提供檔案（模擬 Android AssetWebViewClient）
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    let urlPath = url.pathname;
    
    // 主頁
    if (urlPath === '/' || urlPath === '') {
      const content = fs.readFileSync(path.join(OUT_DIR, 'index.html'), 'utf-8');
      return route.fulfill({ status: 200, contentType: 'text/html', body: content });
    }
    
    // 移除前導 /
    const filePath = path.join(OUT_DIR, urlPath);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const content = fs.readFileSync(filePath);
      return route.fulfill({ status: 200, contentType: getMime(filePath), body: content });
    }
    
    // cordova.js 回傳空
    if (urlPath.includes('cordova')) {
      return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    }
    
    console.log('[404]', urlPath);
    return route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not Found: ' + urlPath });
  });
  
  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => logs.push(`[PAGEERROR] ${err.message}`));
  page.on('requestfailed', req => logs.push(`[REQFAIL] ${req.url()}`));
  
  // 模擬 AndroidInterface
  await page.addInitScript(() => {
    window.AndroidInterface = {
      isNative: () => true,
      _signIn: () => {
        // 模擬登入失敗
        setTimeout(() => {
          window.__handleGoogleSignInResult(JSON.stringify({success: false, error: '測試環境不支援 Google 登入'}));
        }, 100);
      },
      openUrl: (url) => console.log('openUrl:', url),
      getAppVersion: () => JSON.stringify({versionName: '1.5.0-test', versionCode: 150}),
    };
  });
  
  const url = 'https://localhost/';
  console.log('Trying URL:', url);
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('Page loaded, waiting for hydration...');
    await page.waitForTimeout(8000);
  } catch (e) {
    console.log('GOTO ERROR:', e.message);
  }
  
  const title = await page.title();
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 1500));
  const hasReact = await page.evaluate(() => typeof window.React !== 'undefined');
  const hasTurbopack = await page.evaluate(() => typeof globalThis.TURBOPACK !== 'undefined');
  const hasAndroidInterface = await page.evaluate(() => typeof window.AndroidInterface !== 'undefined');
  const hydrated = await page.evaluate(() => window.__APP_HYDRATED__);
  
  console.log('=== TITLE ===');
  console.log(title);
  console.log('\n=== BODY TEXT ===');
  console.log(bodyText);
  console.log('\n=== STATE ===');
  console.log('React:', hasReact, 'TURBOPACK:', hasTurbopack, 'AndroidInterface:', hasAndroidInterface, 'Hydrated:', hydrated);
  console.log('\n=== LOGS ===');
  logs.forEach(l => console.log(l));
  
  await page.screenshot({ path: '/tmp/app-playwright.png', fullPage: true });
  console.log('\n=== Screenshot saved ===');
  
  await browser.close();
})();
