// 多語系翻譯系統
// 支援 5 種語言：繁中/簡中/英文/日文/韓文

export type LangCode = "zh-TW" | "zh-CN" | "en" | "ja" | "ko";

// 所有需要翻譯的文字 key
export interface Translations {
  // Tab 標籤
  tab_home: string;
  tab_record: string;
  tab_markets: string;
  tab_transactions: string;
  tab_stats: string;
  tab_settings: string;

  // 通用
  loading: string;
  confirm: string;
  cancel: string;
  delete: string;
  edit: string;
  save: string;
  add: string;
  search: string;
  today: string;
  week: string;
  month: string;
  all: string;
  none: string;
  total: string;
  subtotal: string;

  // 首頁
  home_today_overview: string;
  home_today_profit: string;
  home_income: string;
  home_expense: string;
  home_transactions: string;
  home_avg_order: string;
  home_profit: string;
  home_today_records: string;
  home_no_transactions: string;
  home_category: string;
  home_view_all: string;

  // 記帳頁
  record_title: string;
  record_payment_method: string;
  record_tap_to_record: string;
  record_long_press_hint: string;
  record_undo: string;
  record_undo_last: string;
  record_manual_entry: string;
  record_expense: string;
  record_income: string;
  record_amount: string;
  record_category: string;
  record_market: string;
  record_no_market: string;
  record_note_optional: string;
  record_complete: string;
  record_order_details: string;
  record_new_order: string;
  record_qty: string;
  record_enter_qty: string;
  record_modify_item: string;
  record_note_label: string;

  // 商品管理
  products_title: string;
  products_total: string;
  products_add: string;
  products_edit: string;
  products_name: string;
  products_price: string;
  products_unit: string;
  products_color: string;
  products_color_optional: string;
  products_save: string;
  products_save_edit: string;
  products_add_product: string;
  products_edit_product: string;

  // 記錄頁
  transactions_title: string;
  transactions_today: string;
  transactions_this_week: string;
  transactions_this_month: string;
  transactions_all: string;
  transactions_today_profit: string;
  transactions_records: string;
  transactions_groups: string;
  transactions_no_records: string;
  transactions_no_records_hint: string;
  transactions_no_match: string;
  transactions_no_match_hint: string;
  transactions_search_placeholder: string;
  transactions_order: string;
  transactions_items: string;
  transactions_summary: string;

  // 市集頁
  markets_title: string;
  markets_subtitle: string;
  markets_add: string;
  markets_upcoming: string;
  markets_month_events: string;
  markets_no_events: string;
  markets_date_range: string;
  markets_market_name: string;
  markets_location: string;
  markets_booth_fee: string;
  markets_booth_number: string;
  markets_business_hours: string;
  markets_color: string;
  markets_notes: string;
  markets_auto_fee: string;
  markets_auto_fee_desc: string;
  markets_add_market: string;
  markets_edit_market: string;
  markets_per_day: string;
  markets_total_mode: string;
  markets_sticky_notes: string;
  markets_sticky_add: string;
  markets_sticky_placeholder: string;
  markets_sticky_empty: string;
  markets_sticky_paste: string;
  markets_no_transactions_day: string;

  // 報表頁
  stats_title: string;
  stats_this_week: string;
  stats_this_month: string;
  stats_income: string;
  stats_expense: string;
  stats_net_profit: string;
  stats_avg_order: string;
  stats_daily_trend: string;
  stats_category_stats: string;
  stats_no_data: string;
  stats_orders: string;
  stats_orders_and_count: string;
  stats_count_unit: string;

  // 通用
  common_more: string;
  common_edit: string;
  common_delete: string;
  common_income: string;
  common_expense: string;
  common_transactions_count: string;
  common_count_unit: string;
  common_back: string;

  // 帳號/Google Drive 頁
  auth_title: string;
  auth_desc: string;
  auth_google_login: string;
  auth_loading: string;
  auth_login_failed: string;
  auth_google_not_loaded: string;
  auth_no_client_id: string;
  auth_logged_in: string;
  auth_google_user: string;
  auth_storage: string;
  auth_local: string;
  auth_cloud: string;
  auth_local_desc: string;
  auth_cloud_desc: string;
  auth_backup: string;
  auth_restore: string;
  auth_uploading: string;
  auth_restoring: string;
  auth_backup_done: string;
  auth_restore_done: string;
  auth_restore_confirm: string;

  // 會員系統
  membership_title: string;
  membership_free: string;
  membership_pro: string;
  membership_business: string;
  membership_current_plan: string;
  membership_upgrade: string;
  membership_monthly: string;
  membership_expires: string;
  membership_free_forever: string;
  membership_cancel: string;
  membership_features: string;
  membership_feature_unlimited: string;
  membership_feature_cloud_backup: string;
  membership_feature_advanced_reports: string;
  membership_feature_custom_categories: string;
  membership_feature_export: string;
  membership_feature_multi_device: string;
  membership_feature_max_products: string;
  membership_feature_max_markets: string;
  membership_feature_max_transactions: string;
  membership_demo_badge: string;
  membership_coming_soon: string;
  membership_current: string;
  membership_select_plan: string;

  // 設定頁
  settings_title: string;
  settings_test_account: string;
  settings_logged_in: string;
  settings_logout: string;
  settings_preferences: string;
  settings_currency: string;
  settings_language: string;
  settings_haptic: string;
  settings_haptic_desc: string;
  settings_haptic_strength: string;
  settings_haptic_light: string;
  settings_haptic_medium: string;
  settings_haptic_strong: string;
  settings_haptic_test: string;
  settings_dark_mode: string;
  settings_dark_mode_desc: string;
  settings_data_management: string;
  settings_export: string;
  settings_export_csv: string;
  settings_export_json: string;
  settings_export_excel: string;
  settings_export_backup: string;
  settings_clear_data: string;
  settings_clear_desc: string;
  settings_clear_confirm: string;
  settings_clear_confirm_title: string;
  settings_clear_confirm_msg: string;
  settings_cleared: string;
  settings_logout_confirm: string;
  settings_app_update: string;
  settings_current_version: string;
  settings_recheck: string;
  settings_manual_check: string;
  settings_download_update: string;
  settings_latest: string;
  settings_new_version: string;
  settings_published: string;
  settings_check_failed: string;
  settings_checking: string;
  settings_retry: string;
  settings_downloading: string;
  settings_download_complete: string;
  settings_keep_app_open: string;
  settings_download_failed: string;
  settings_open_browser: string;
  settings_version_info: string;
  settings_export_count: string;
  settings_about: string;
  settings_developer: string;
  settings_tech_stack: string;
  settings_update_date: string;
  settings_version_tag: string;
  settings_no_export: string;

  // 登入頁
  login_title: string;
  login_subtitle: string;
  login_test_account: string;
  login_test_desc: string;
  login_username: string;
  login_password: string;
  login_enter_username: string;
  login_enter_password: string;
  login_button: string;
  login_verifying: string;
  login_error: string;
  login_error_empty: string;
  login_warning: string;

  // 語言選擇
  language_title: string;
  language_desc: string;
  language_confirm: string;

  // 貨幣選擇
  currency_title: string;
  currency_desc: string;
  currency_confirm: string;
  currency_default: string;

  // 分類
  cat_sales: string;
  cat_other_income: string;
  cat_rent: string;
  cat_stock: string;
  cat_transport: string;
  cat_food: string;
  cat_packaging: string;
  cat_misc: string;
  cat_other_expense: string;

  // 支付方式
  pay_cash: string;
  pay_credit_card: string;
  pay_apple_pay: string;
  pay_google_pay: string;
  pay_bank_transfer: string;
  pay_paypal: string;
  pay_payme: string;
  pay_alipayhk: string;
  pay_wechat_pay: string;
  pay_fps: string;
  pay_octopus: string;
  pay_line_pay: string;
  pay_jkopay: string;
  pay_truemoney: string;
  pay_tng: string;
  pay_grabpay: string;
  pay_duitnow: string;
  pay_promptpay: string;
  pay_other: string;
  pay_unknown: string;
  pay_custom: string;

  // 支付方式分類（地區）
  paycat_common: string;
  paycat_hk: string;
  paycat_tw: string;
  paycat_sea: string;

  // 日期/時間
  date_today: string;
  date_yesterday: string;
  date_year: string;
  time_format: string;

  // 商品表單（補充）
  products_no_items: string;
  products_no_items_hint: string;
  products_selected_count: string;
  products_select_hint: string;
  products_long_press_hint: string;
  products_delete_selected: string;
  products_delete_confirm: string;
  products_name_required: string;
  products_price_required: string;
  products_name_placeholder: string;
  products_price_placeholder: string;
  products_unit_placeholder: string;
  products_color_label: string;
  products_count: string;
  products_view_grid: string;
  products_view_list: string;
  products_unit_default: string;

  // 記帳頁 - 其他
  record_amount_required: string;
  record_tap_hint: string;
  record_confirm: string;
  record_close_notification: string;
  record_unit_price: string;
  record_cancelled: string;
  record_sort_hint: string;
  record_sorting: string;
  record_grayscale: string;
  record_selected: string;

  // Demo 資料（按語言切換的商品名稱和備註）
  demo_cookie: string;
  demo_jewelry: string;
  demo_jam: string;
  demo_coffee: string;
  demo_cookie_note: string;
  demo_jewelry_note: string;
  demo_jam_note: string;
  demo_stock_note: string;
  demo_packaging_note: string;
  demo_rent_note: string;
  demo_unit_pack: string;
  demo_unit_piece: string;
  demo_unit_bottle: string;
  demo_unit_cup: string;

  // 市集頁
  markets_weekday_sun: string;
  markets_weekday_mon: string;
  markets_weekday_tue: string;
  markets_weekday_wed: string;
  markets_weekday_thu: string;
  markets_weekday_fri: string;
  markets_weekday_sat: string;
  markets_month_prefix: string;
  markets_today: string;
  markets_yesterday: string;
  markets_select_start: string;
  markets_select_end_hint: string;
  markets_end_before_start: string;

  // 新增支付方式 Modal
  record_payment_add_title: string;
  record_payment_name_label: string;
  record_payment_name_placeholder: string;
  record_payment_icon_label: string;
  record_payment_color_label: string;
  record_payment_add_button: string;
  record_payment_name_required: string;

  // 商品表單
  record_no_products: string;
  record_create_products: string;

  // 版本檢查錯誤訊息
  settings_err_rate_limit: string;
  settings_err_no_release: string;
  settings_err_check_failed: string;
}

// 繁體中文（預設）
const zhTW: Translations = {
  tab_home: "概況",
  tab_record: "記帳",
  tab_markets: "市集",
  tab_transactions: "記錄",
  tab_stats: "報表",
  tab_settings: "設定",

  loading: "載入中...",
  confirm: "確認",
  cancel: "取消",
  delete: "刪除",
  edit: "編輯",
  save: "儲存",
  add: "新增",
  search: "搜索",
  today: "今日",
  week: "本週",
  month: "本月",
  all: "全部",
  none: "無",
  total: "總計",
  subtotal: "小計",

  home_today_overview: "今日概況",
  home_today_profit: "今日淨利",
  home_income: "收",
  home_expense: "支",
  home_transactions: "交易筆數",
  home_avg_order: "平均客單",
  home_profit: "淨利",
  home_today_records: "今日記錄",
  home_no_transactions: "今日還沒有交易",
  home_category: "分類",
  home_view_all: "查看全部",

  record_title: "記帳",
  record_payment_method: "支付方式",
  record_tap_to_record: "⚡ 點商品即記錄銷售",
  record_long_press_hint: "長按調數量 · ←輸入 · →取消",
  record_undo: "撤銷",
  record_undo_last: "撤銷上筆",
  record_enter_qty: "輸入數量",
  record_manual_entry: "手動記帳（自訂金額 / 支出 / 分類）",
  record_expense: "💸 支出",
  record_income: "💰 收入",
  record_amount: "金額",
  record_category: "分類",
  record_market: "市集",
  record_no_market: "🌐 不指定市集",
  record_note_optional: "備註（選填）",
  record_complete: "✓ 完成記帳",
  record_order_details: "本單明細",
  record_new_order: "新一單",
  record_qty: "輸入數量",
  record_modify_item: "修改項目",
  record_note_label: "備註（選填）",
  record_no_products: "尚無商品",
  record_create_products: "切換到「商品管理」建立商品目錄",

  products_title: "商品",
  products_total: "共",
  products_add: "新增商品",
  products_edit: "更正",
  products_name: "商品名稱",
  products_price: "單價",
  products_unit: "單位",
  products_color: "按鈕顏色（選填，用於快速識別商品組）",
  products_color_optional: "按鈕顏色（選填）",
  products_save: "儲存商品",
  products_save_edit: "儲存修改",
  products_add_product: "新增商品",
  products_edit_product: "編輯商品",

  transactions_title: "交易記錄",
  transactions_today: "今日",
  transactions_this_week: "本週",
  transactions_this_month: "本月",
  transactions_all: "全部",
  transactions_today_profit: "今日淨利",
  transactions_records: "交易記錄",
  transactions_groups: "組",
  transactions_no_records: "還沒有交易記錄",
  transactions_no_records_hint: "前往「記帳」頁面開始記錄",
  transactions_no_match: "沒有符合條件的記錄",
  transactions_no_match_hint: "試試其他搜索條件",
  transactions_search_placeholder: "搜索商品名稱或備註...",
  transactions_order: "商品",
  transactions_items: "項",
  transactions_summary: "合計",

  markets_title: "市集日曆",
  markets_subtitle: "點日期看記錄 · 看市集活動",
  markets_add: "新增",
  markets_upcoming: "即將到來",
  markets_month_events: "市集",
  markets_no_events: "所有支付方式已顯示",
  markets_date_range: "日期範圍",
  markets_market_name: "市集名稱 *",
  markets_location: "地點",
  markets_booth_fee: "攤位費用",
  markets_booth_number: "攤位編號",
  markets_business_hours: "營業時段",
  markets_color: "標記顏色",
  markets_notes: "備註",
  markets_auto_fee: "自動記帳攤位費",
  markets_auto_fee_desc: "每天自動加上攤位費支出",
  markets_add_market: "新增市集",
  markets_edit_market: "編輯市集",
  markets_per_day: "每天",
  markets_total_mode: "總計",
  markets_sticky_notes: "便條貼",
  markets_sticky_add: "新增",
  markets_sticky_placeholder: "寫下你想記的事…",
  markets_sticky_empty: "點「新增」寫下便條貼",
  markets_sticky_paste: "貼上",
  markets_no_transactions_day: "這天沒有交易",

  stats_title: "統計報表",
  stats_this_week: "本週",
  stats_this_month: "本月",
  stats_income: "收入",
  stats_expense: "支出",
  stats_net_profit: "淨利",
  stats_avg_order: "平均客單",
  stats_daily_trend: "每日淨利趨勢",
  stats_category_stats: "分類統計",
  stats_no_data: "尚無數據",
  stats_orders: "單",
  stats_orders_and_count: "{orders} 單 · {count} 筆",
  stats_count_unit: "筆",

  common_more: "更多",
  common_edit: "編輯",
  common_delete: "刪除",
  common_income: "收入",
  common_expense: "支出",
  common_transactions_count: "{n} 筆交易",
  common_count_unit: "筆",
  common_back: "返回",

  auth_title: "帳號登入",
  auth_desc: "登入 Google 帳號後，可將資料備份到 Google Drive，跨裝置同步。",
  auth_google_login: "使用 Google 登入",
  auth_loading: "登入中...",
  auth_login_failed: "登入失敗",
  auth_google_not_loaded: "Google 服務尚未載入",
  auth_no_client_id: "未設定 Google Client ID",
  auth_logged_in: "(已登入)",
  auth_google_user: "Google 用戶",
  auth_storage: "資料儲存",
  auth_local: "本機",
  auth_cloud: "雲端",
  auth_local_desc: "資料只存在這台裝置",
  auth_cloud_desc: "資料同步到 Google Drive，可跨裝置存取",
  auth_backup: "備份",
  auth_restore: "還原",
  auth_uploading: "正在上傳...",
  auth_restoring: "正在從雲端還原...",
  auth_backup_done: "✓ 已備份到 Google Drive",
  auth_restore_done: "✓ 已從 Google Drive 還原",
  auth_restore_confirm: "還原會覆蓋目前所有資料，確定嗎？",

  membership_title: "會員方案",
  membership_free: "免費版",
  membership_pro: "專業版",
  membership_business: "商業版",
  membership_current_plan: "目前方案",
  membership_upgrade: "升級方案",
  membership_monthly: "/月",
  membership_expires: "到期日",
  membership_free_forever: "永久免費",
  membership_cancel: "取消訂閱",
  membership_features: "功能",
  membership_feature_unlimited: "無限制",
  membership_feature_cloud_backup: "雲端備份",
  membership_feature_advanced_reports: "進階報表",
  membership_feature_custom_categories: "自訂分類",
  membership_feature_export: "匯出資料",
  membership_feature_multi_device: "多裝置同步",
  membership_feature_max_products: "最多 {n} 個商品",
  membership_feature_max_markets: "最多 {n} 個市集",
  membership_feature_max_transactions: "每月 {n} 筆交易",
  membership_demo_badge: "Demo",
  membership_coming_soon: "即將推出",
  membership_current: "目前",
  membership_select_plan: "選擇方案",

  settings_title: "設定",
  settings_test_account: "測試帳號",
  settings_logged_in: "已登入測試帳號",
  settings_logout: "登出",
  settings_preferences: "偏好設定",
  settings_currency: "幣別",
  settings_language: "語言",
  settings_haptic: "震動回饋",
  settings_haptic_desc: "點擊按鈕、滑動商品時震動",
  settings_haptic_strength: "震動強度",
  settings_haptic_light: "輕",
  settings_haptic_medium: "中",
  settings_haptic_strong: "強",
  settings_haptic_test: "測試震動",
  settings_dark_mode: "深色模式",
  settings_dark_mode_desc: "護眼模式，夜間使用更舒適",
  settings_data_management: "資料管理",
  settings_export: "匯出資料",
  settings_export_csv: "CSV",
  settings_export_json: "JSON",
  settings_export_excel: "Excel 可用",
  settings_export_backup: "完整備份",
  settings_clear_data: "清除資料",
  settings_clear_desc: "刪除所有交易記錄",
  settings_clear_confirm: "確認清除",
  settings_clear_confirm_title: "清除所有資料？",
  settings_clear_confirm_msg: "將刪除 {n} 筆交易記錄與所有商品資料，此操作無法復原。",
  settings_cleared: "已清除所有交易記錄",
  settings_logout_confirm: "確定要登出測試帳號嗎？",
  settings_app_update: "應用更新",
  settings_current_version: "目前版本",
  settings_recheck: "重新檢查",
  settings_manual_check: "手動查看",
  settings_download_update: "下載更新",
  settings_latest: "已是最新版本",
  settings_new_version: "發現新版本",
  settings_published: "發布於",
  settings_check_failed: "檢查失敗",
  settings_checking: "正在檢查最新版本...",
  settings_retry: "重試",
  settings_downloading: "下載中...",
  settings_download_complete: "下載完成！點擊通知安裝",
  settings_keep_app_open: "請保持 App 開啟，不要離開",
  settings_download_failed: "下載失敗",
  settings_open_browser: "已開啟瀏覽器下載",
  settings_version_info: "版本資訊",
  settings_export_count: "筆交易",
  settings_about: "關於",
  settings_developer: "開發者",
  settings_tech_stack: "技術棧",
  settings_update_date: "更新日期",
  settings_version_tag: "版本標籤",
  settings_no_export: "目前沒有交易記錄可以匯出",

  login_title: "市集記賬本",
  login_subtitle: "MarketLedger · 測試版",
  login_test_account: "登入測試帳號",
  login_test_desc: "僅限持有測試帳號的使用者使用",
  login_username: "帳號",
  login_password: "密碼",
  login_enter_username: "輸入帳號",
  login_enter_password: "輸入密碼",
  login_button: "登入",
  login_verifying: "驗證中...",
  login_error: "帳號或密碼錯誤",
  login_error_empty: "請輸入帳號和密碼",
  login_warning: "本應用程式為測試版本，僅供受邀測試者使用。未經授權請勿散布。",

  language_title: "選擇語言",
  language_desc: "選擇你使用的語言，之後可隨時在設定中更改",
  language_confirm: "確認選擇",

  currency_title: "選擇你的貨幣",
  currency_desc: "選擇你主要使用的貨幣，之後可隨時在設定中更改",
  currency_confirm: "確認選擇",
  currency_default: "預設貨幣",

  cat_sales: "銷售",
  cat_other_income: "其他收入",
  cat_rent: "攤位費",
  cat_stock: "進貨",
  cat_transport: "交通",
  cat_food: "餐飲",
  cat_packaging: "包裝材料",
  cat_misc: "雜費",
  cat_other_expense: "其他",

  pay_cash: "現金",
  pay_credit_card: "信用卡",
  pay_apple_pay: "Apple Pay",
  pay_google_pay: "Google Pay",
  pay_bank_transfer: "銀行轉帳",
  pay_paypal: "PayPal",
  pay_payme: "PayMe",
  pay_alipayhk: "AlipayHK",
  pay_wechat_pay: "WeChat Pay",
  pay_fps: "轉數快 FPS",
  pay_octopus: "八達通",
  pay_line_pay: "LINE Pay",
  pay_jkopay: "街口支付",
  pay_truemoney: "TrueMoney",
  pay_tng: "Touch 'n Go",
  pay_grabpay: "GrabPay",
  pay_duitnow: "DuitNow",
  pay_promptpay: "PromptPay",
  pay_other: "其他",
  pay_unknown: "未知",
  pay_custom: "自訂",

  paycat_common: "通用",
  paycat_hk: "香港",
  paycat_tw: "台灣",
  paycat_sea: "東南亞",

  date_today: "今日",
  date_yesterday: "昨日",
  date_year: "年",
  time_format: "zh-TW",

  products_no_items: "尚無商品",
  products_no_items_hint: "切換到「商品管理」建立商品目錄",
  products_selected_count: "已選 {n} 個商品",
  products_select_hint: "點擊其他商品加入選擇 · 點擊空白處或取消鍵退出",
  products_long_press_hint: "長按任一商品進入多選刪除模式 · 可一次選擇多個商品刪除 · 點擊空白處或取消鍵退出",
  products_delete_selected: "刪除 ({n})",
  products_delete_confirm: "確定要刪除選中的 {n} 個商品？",
  products_name_required: "請輸入商品名稱",
  products_price_required: "請輸入有效單價",
  products_name_placeholder: "商品名稱",
  products_price_placeholder: "單價",
  products_unit_placeholder: "單位",
  products_color_label: "按鈕顏色（選填，用於快速識別商品組）",
  products_count: "共 {n} 個商品",
  products_view_grid: "格子顯示",
  products_view_list: "列表顯示",
  products_unit_default: "個",

  record_amount_required: "請輸入金額",
  record_tap_hint: "點商品即記錄銷售",
  record_confirm: "確認",
  record_close_notification: "關閉通知",
  record_unit_price: "單價",
  record_cancelled: "已取消",
  record_sort_hint: "長按排序",
  record_sorting: "拖拽排序中",
  record_grayscale: "灰階",
  record_selected: "已選",

  demo_cookie: "手作餅乾",
  demo_jewelry: "手工飾品",
  demo_jam: "果醬",
  demo_coffee: "咖啡",
  demo_cookie_note: "賣手作餅乾",
  demo_jewelry_note: "賣手工飾品",
  demo_jam_note: "賣果醬",
  demo_stock_note: "進貨麵粉、奶油",
  demo_packaging_note: "包裝盒",
  demo_rent_note: "PMQ 攤位費",
  demo_unit_pack: "包",
  demo_unit_piece: "件",
  demo_unit_bottle: "瓶",
  demo_unit_cup: "杯",

  markets_weekday_sun: "日",
  markets_weekday_mon: "一",
  markets_weekday_tue: "二",
  markets_weekday_wed: "三",
  markets_weekday_thu: "四",
  markets_weekday_fri: "五",
  markets_weekday_sat: "六",
  markets_month_prefix: "",
  markets_today: "今日",
  markets_yesterday: "昨日",
  markets_select_start: "點選市集開始日",
  markets_select_end_hint: "再點一次取消，或點結束日",
  markets_end_before_start: "結束日期不能早於開始日期",

  record_payment_add_title: "新增支付方式",
  record_payment_name_label: "名稱",
  record_payment_name_placeholder: "例如：八達通、PayPal",
  record_payment_icon_label: "圖示",
  record_payment_color_label: "顏色",
  record_payment_add_button: "新增",
  record_payment_name_required: "請輸入名稱",

  settings_err_rate_limit: "GitHub API 存取頻率受限，請稍後再試",
  settings_err_no_release: "尚未發布任何版本",
  settings_err_check_failed: "檢查失敗",
};

// 簡體中文
const zhCN: Translations = {
  ...zhTW,
  tab_home: "概况",
  tab_record: "记账",
  tab_markets: "市集",
  tab_transactions: "记录",
  tab_stats: "报表",
  tab_settings: "设定",
  home_today_overview: "今日概况",
  home_today_profit: "今日净利",
  home_income: "收",
  home_expense: "支",
  home_transactions: "交易笔数",
  home_avg_order: "平均客单",
  home_profit: "净利",
  home_today_records: "今日记录",
  home_no_transactions: "今日还没有交易",
  home_category: "分类",
  home_view_all: "查看全部",
  record_title: "记账",
  record_payment_method: "支付方式",
  record_tap_to_record: "⚡ 点商品即记录销售",
  record_long_press_hint: "长按调数量 · ←输入 · →取消",
  record_undo: "撤销",
  record_undo_last: "撤销上笔",
  record_enter_qty: "输入数量",
  record_manual_entry: "手动记账（自订金额 / 支出 / 分类）",
  record_expense: "💸 支出",
  record_income: "💰 收入",
  record_amount: "金额",
  record_category: "分类",
  record_market: "市集",
  record_no_market: "🌐 不指定市集",
  record_note_optional: "备注（选填）",
  record_complete: "✓ 完成记账",
  record_order_details: "本单明细",
  record_new_order: "新一单",
  record_qty: "输入数量",
  record_modify_item: "修改项目",
  record_note_label: "备注（选填）",
  record_no_products: "尚无商品",
  record_create_products: "切换到「商品管理」建立商品目录",
  products_title: "商品",
  products_total: "共",
  products_add: "新增商品",
  products_edit: "更正",
  products_name: "商品名称",
  products_price: "单价",
  products_unit: "单位",
  products_color: "按钮颜色（选填，用于快速识别商品组）",
  products_color_optional: "按钮颜色（选填）",
  products_save: "储存商品",
  products_save_edit: "储存修改",
  products_add_product: "新增商品",
  products_edit_product: "编辑商品",
  transactions_title: "交易记录",
  transactions_today: "今日",
  transactions_this_week: "本周",
  transactions_this_month: "本月",
  transactions_all: "全部",
  transactions_today_profit: "今日净利",
  transactions_records: "交易记录",
  transactions_groups: "组",
  transactions_no_records: "还没有交易记录",
  transactions_no_records_hint: "前往「记账」页面开始记录",
  transactions_no_match: "没有符合条件的记录",
  transactions_no_match_hint: "试试其他搜索条件",
  transactions_search_placeholder: "搜索商品名称或备注...",
  transactions_order: "商品",
  transactions_items: "项",
  transactions_summary: "合计",
  markets_title: "市集日历",
  markets_subtitle: "点日期看记录 · 看市集活动",
  markets_add: "新增",
  markets_upcoming: "即将到来",
  markets_month_events: "市集",
  markets_no_events: "所有支付方式已显示",
  markets_date_range: "日期范围",
  markets_market_name: "市集名称 *",
  markets_location: "地点",
  markets_booth_fee: "摊位费用",
  markets_booth_number: "摊位编号",
  markets_business_hours: "营业时段",
  markets_color: "标记颜色",
  markets_notes: "备注",
  markets_auto_fee: "自动记账摊位费",
  markets_auto_fee_desc: "每天自动加上摊位费支出",
  markets_add_market: "新增市集",
  markets_edit_market: "编辑市集",
  markets_per_day: "每天",
  markets_total_mode: "总计",
  markets_sticky_notes: "便条贴",
  markets_sticky_add: "新增",
  markets_sticky_placeholder: "写下你想记的事…",
  markets_sticky_empty: "点「新增」写下便条贴",
  markets_sticky_paste: "贴上",
  markets_no_transactions_day: "这天没有交易",
  stats_title: "统计报表",
  stats_this_week: "本周",
  stats_this_month: "本月",
  stats_income: "收入",
  stats_expense: "支出",
  stats_net_profit: "净利",
  stats_avg_order: "平均客单",
  stats_daily_trend: "每日净利趋势",
  stats_category_stats: "分类统计",
  stats_no_data: "尚无数据",
  stats_orders: "单",
  stats_orders_and_count: "{orders} 单 · {count} 笔",
  stats_count_unit: "笔",

  common_more: "更多",
  common_edit: "编辑",
  common_delete: "删除",
  common_income: "收入",
  common_expense: "支出",
  common_transactions_count: "{n} 笔交易",
  common_count_unit: "笔",
  common_back: "返回",

  auth_title: "账号登录",
  auth_desc: "登录 Google 帐号后，可将数据备份到 Google Drive，跨装置同步。",
  auth_google_login: "使用 Google 登录",
  auth_loading: "登录中...",
  auth_login_failed: "登录失败",
  auth_google_not_loaded: "Google 服务尚未载入",
  auth_no_client_id: "未设定 Google Client ID",
  auth_logged_in: "(已登录)",
  auth_google_user: "Google 用户",
  auth_storage: "数据储存",
  auth_local: "本机",
  auth_cloud: "云端",
  auth_local_desc: "数据只存在这台装置",
  auth_cloud_desc: "数据同步到 Google Drive，可跨装置存取",
  auth_backup: "备份",
  auth_restore: "还原",
  auth_uploading: "正在上传...",
  auth_restoring: "正在从云端还原...",
  auth_backup_done: "✓ 已备份到 Google Drive",
  auth_restore_done: "✓ 已从 Google Drive 还原",
  auth_restore_confirm: "还原会覆盖目前所有数据，确定吗？",

  membership_title: "会员方案",
  membership_free: "免费版",
  membership_pro: "专业版",
  membership_business: "商业版",
  membership_current_plan: "目前方案",
  membership_upgrade: "升级方案",
  membership_monthly: "/月",
  membership_expires: "到期日",
  membership_free_forever: "永久免费",
  membership_cancel: "取消订阅",
  membership_features: "功能",
  membership_feature_unlimited: "无限制",
  membership_feature_cloud_backup: "云端备份",
  membership_feature_advanced_reports: "进阶报表",
  membership_feature_custom_categories: "自定义分类",
  membership_feature_export: "导出数据",
  membership_feature_multi_device: "多装置同步",
  membership_feature_max_products: "最多 {n} 个商品",
  membership_feature_max_markets: "最多 {n} 个市集",
  membership_feature_max_transactions: "每月 {n} 笔交易",
  membership_demo_badge: "Demo",
  membership_coming_soon: "即将推出",
  membership_current: "目前",
  membership_select_plan: "选择方案",

  settings_title: "设定",
  settings_test_account: "测试帐号",
  settings_logged_in: "已登入测试帐号",
  settings_logout: "登出",
  settings_preferences: "偏好设定",
  settings_currency: "币别",
  settings_language: "语言",
  settings_haptic: "震动回馈",
  settings_haptic_desc: "点击按钮、滑动商品时震动",
  settings_haptic_strength: "震动强度",
  settings_haptic_light: "轻",
  settings_haptic_medium: "中",
  settings_haptic_strong: "强",
  settings_haptic_test: "测试震动",
  settings_dark_mode: "深色模式",
  settings_dark_mode_desc: "护眼模式，夜间使用更舒适",
  settings_data_management: "数据管理",
  settings_export: "汇出数据",
  settings_export_csv: "CSV",
  settings_export_json: "JSON",
  settings_export_excel: "Excel 可用",
  settings_export_backup: "完整备份",
  settings_clear_data: "清除数据",
  settings_clear_desc: "删除所有交易记录",
  settings_clear_confirm: "确认清除",
  settings_clear_confirm_title: "清除所有数据？",
  settings_clear_confirm_msg: "将删除 {n} 笔交易记录与所有商品数据，此操作无法复原。",
  settings_cleared: "已清除所有交易记录",
  settings_logout_confirm: "确定要登出测试帐号吗？",
  settings_app_update: "应用更新",
  settings_current_version: "目前版本",
  settings_recheck: "重新检查",
  settings_manual_check: "手动查看",
  settings_download_update: "下载更新",
  settings_latest: "已是最新版本",
  settings_new_version: "发现新版本",
  settings_published: "发布于",
  settings_check_failed: "检查失败",
  settings_checking: "正在检查最新版本...",
  settings_retry: "重试",
  settings_downloading: "下载中...",
  settings_download_complete: "下载完成！点击通知安装",
  settings_keep_app_open: "请保持 App 开启，不要离开",
  settings_download_failed: "下载失败",
  settings_open_browser: "已开启浏览器下载",
  settings_version_info: "版本信息",
  settings_export_count: "笔交易",
  settings_about: "关于",
  settings_developer: "开发者",
  settings_tech_stack: "技术栈",
  settings_update_date: "更新日期",
  settings_version_tag: "版本标签",
  settings_no_export: "目前没有交易记录可以汇出",
  login_title: "市集记账本",
  login_subtitle: "MarketLedger · 测试版",
  login_test_account: "登入测试帐号",
  login_test_desc: "仅限持有测试帐号的使用者使用",
  login_username: "帐号",
  login_password: "密码",
  login_enter_username: "输入帐号",
  login_enter_password: "输入密码",
  login_button: "登入",
  login_verifying: "验证中...",
  login_error: "帐号或密码错误",
  login_error_empty: "请输入帐号和密码",
  login_warning: "本应用程式为测试版本，仅供受邀测试者使用。未经授权请勿散布。",
  language_title: "选择语言",
  language_desc: "选择你使用的语言，之后可随时在设定中更改",
  language_confirm: "确认选择",
  currency_title: "选择你的货币",
  currency_desc: "选择你主要使用的货币，之后可随时在设定中更改",
  currency_confirm: "确认选择",
  currency_default: "预设货币",
  cat_sales: "销售",
  cat_other_income: "其他收入",
  cat_rent: "摊位费",
  cat_stock: "进货",
  cat_transport: "交通",
  cat_food: "餐饮",
  cat_packaging: "包装材料",
  cat_misc: "杂费",
  cat_other_expense: "其他",

  pay_cash: "现金",
  pay_credit_card: "信用卡",
  pay_bank_transfer: "银行转帐",
  pay_octopus: "八达通",
  pay_jkopay: "街口支付",
  pay_fps: "转数快 FPS",
  pay_other: "其他",
  pay_unknown: "未知",
  pay_custom: "自订",

  paycat_common: "通用",
  paycat_hk: "香港",
  paycat_tw: "台湾",
  paycat_sea: "东南亚",

  products_no_items: "尚无商品",
  products_no_items_hint: "切换到「商品管理」建立商品目录",
  products_selected_count: "已选 {n} 个商品",
  products_select_hint: "点击其他商品加入选择 · 点击空白处或取消键退出",
  products_long_press_hint: "长按任一商品进入多选删除模式 · 可一次选择多个商品删除 · 点击空白处或取消键退出",
  products_delete_selected: "删除 ({n})",
  products_delete_confirm: "确定要删除选中的 {n} 个商品？",
  products_name_required: "请输入商品名称",
  products_price_required: "请输入有效单价",
  products_name_placeholder: "商品名称",
  products_price_placeholder: "单价",
  products_unit_placeholder: "单位",
  products_color_label: "按钮颜色（选填，用于快速识别商品组）",
  products_count: "共 {n} 个商品",
  products_view_grid: "格子显示",
  products_view_list: "列表显示",
  products_unit_default: "个",

  record_amount_required: "请输入金额",
  record_tap_hint: "点商品即记录销售",
  record_confirm: "确认",
  record_close_notification: "关闭通知",
  record_unit_price: "单价",
  record_cancelled: "已取消",
  record_sort_hint: "长按排序",
  record_sorting: "拖拽排序中",
  record_grayscale: "灰阶",
  record_selected: "已选",

  demo_cookie: "手工饼干",
  demo_jewelry: "手工饰品",
  demo_jam: "果酱",
  demo_coffee: "咖啡",
  demo_cookie_note: "卖手工饼干",
  demo_jewelry_note: "卖手工饰品",
  demo_jam_note: "卖果酱",
  demo_stock_note: "进货面粉、奶油",
  demo_packaging_note: "包装盒",
  demo_rent_note: "PMQ 摊位费",
  demo_unit_pack: "包",
  demo_unit_piece: "件",
  demo_unit_bottle: "瓶",
  demo_unit_cup: "杯",

  markets_weekday_sun: "日",
  markets_weekday_mon: "一",
  markets_weekday_tue: "二",
  markets_weekday_wed: "三",
  markets_weekday_thu: "四",
  markets_weekday_fri: "五",
  markets_weekday_sat: "六",
  markets_month_prefix: "",
  markets_today: "今日",
  markets_yesterday: "昨日",
  markets_select_start: "点选市集开始日",
  markets_select_end_hint: "再点一次取消，或点结束日",
  markets_end_before_start: "结束日期不能早于开始日期",

  record_payment_add_title: "新增支付方式",
  record_payment_name_label: "名称",
  record_payment_name_placeholder: "例如：八达通、PayPal",
  record_payment_icon_label: "图标",
  record_payment_color_label: "颜色",
  record_payment_add_button: "新增",
  record_payment_name_required: "请输入名称",

  settings_err_rate_limit: "GitHub API 访问频率受限，请稍后再试",
  settings_err_no_release: "尚未发布任何版本",
  settings_err_check_failed: "检查失败",

  date_today: "今日",
  date_yesterday: "昨日",
  date_year: "年",
  loading: "载入中...",
  confirm: "确认",
  cancel: "取消",
  delete: "删除",
  edit: "编辑",
  save: "储存",
  add: "新增",
  search: "搜索",
  today: "今日",
  week: "本周",
  month: "本月",
  all: "全部",
  none: "无",
  total: "总计",
  subtotal: "小计",
};

// English
const en: Translations = {
  tab_home: "Overview",
  tab_record: "Record",
  tab_markets: "Markets",
  tab_transactions: "History",
  tab_stats: "Reports",
  tab_settings: "Settings",

  loading: "Loading...",
  confirm: "Confirm",
  cancel: "Cancel",
  delete: "Delete",
  edit: "Edit",
  save: "Save",
  add: "Add",
  search: "Search",
  today: "Today",
  week: "Week",
  month: "Month",
  all: "All",
  none: "None",
  total: "Total",
  subtotal: "Subtotal",

  home_today_overview: "Today's Overview",
  home_today_profit: "Today's Net Profit",
  home_income: "In",
  home_expense: "Out",
  home_transactions: "Transactions",
  home_avg_order: "Avg Order",
  home_profit: "Profit",
  home_today_records: "Today's Records",
  home_no_transactions: "No transactions today",
  home_category: "Category",
  home_view_all: "View all",

  record_title: "Record",
  record_payment_method: "Payment Method",
  record_tap_to_record: "⚡ Tap product to record sale",
  record_long_press_hint: "Long press for qty · ←input · →cancel",
  record_undo: "Undo",
  record_undo_last: "Undo last",
  record_enter_qty: "Enter quantity",
  record_manual_entry: "Manual entry (custom amount / expense / category)",
  record_expense: "💸 Expense",
  record_income: "💰 Income",
  record_amount: "Amount",
  record_category: "Category",
  record_market: "Market",
  record_no_market: "🌐 No market",
  record_note_optional: "Note (optional)",
  record_complete: "✓ Complete",
  record_order_details: "Order Details",
  record_new_order: "New Order",
  record_qty: "Enter quantity",
  record_modify_item: "Modify Item",
  record_note_label: "Note (optional)",
  record_no_products: "No products",
  record_create_products: "Switch to Products tab to create catalog",

  products_title: "Products",
  products_total: "Total",
  products_add: "Add Product",
  products_edit: "Edit",
  products_name: "Product Name",
  products_price: "Price",
  products_unit: "Unit",
  products_color: "Button color (optional, for visual grouping)",
  products_color_optional: "Button color (optional)",
  products_save: "Save Product",
  products_save_edit: "Save Changes",
  products_add_product: "Add Product",
  products_edit_product: "Edit Product",

  transactions_title: "Transaction History",
  transactions_today: "Today",
  transactions_this_week: "This Week",
  transactions_this_month: "This Month",
  transactions_all: "All",
  transactions_today_profit: "Today's Net Profit",
  transactions_records: "Records",
  transactions_groups: "groups",
  transactions_no_records: "No transactions yet",
  transactions_no_records_hint: "Go to the Record page to start",
  transactions_no_match: "No matching records",
  transactions_no_match_hint: "Try other search criteria",
  transactions_search_placeholder: "Search product name or note...",
  transactions_order: "Items",
  transactions_items: "items",
  transactions_summary: "Total",

  markets_title: "Market Calendar",
  markets_subtitle: "Tap date for records · View market events",
  markets_add: "Add",
  markets_upcoming: "Upcoming",
  markets_month_events: "Markets",
  markets_no_events: "All payment methods shown",
  markets_date_range: "Date Range",
  markets_market_name: "Market Name *",
  markets_location: "Location",
  markets_booth_fee: "Booth Fee",
  markets_booth_number: "Booth Number",
  markets_business_hours: "Business Hours",
  markets_color: "Color",
  markets_notes: "Notes",
  markets_auto_fee: "Auto-record booth fee",
  markets_auto_fee_desc: "Automatically add booth fee expense daily",
  markets_add_market: "Add Market",
  markets_edit_market: "Edit Market",
  markets_per_day: "Per day",
  markets_total_mode: "Total",
  markets_sticky_notes: "Sticky Notes",
  markets_sticky_add: "Add",
  markets_sticky_placeholder: "Write something...",
  markets_sticky_empty: "Tap \"Add\" to create a note",
  markets_sticky_paste: "Stick",
  markets_no_transactions_day: "No transactions on this day",

  stats_title: "Reports",
  stats_this_week: "This Week",
  stats_this_month: "This Month",
  stats_income: "Income",
  stats_expense: "Expense",
  stats_net_profit: "Net Profit",
  stats_avg_order: "Avg Order",
  stats_daily_trend: "Daily Profit Trend",
  stats_category_stats: "Category Stats",
  stats_no_data: "No data",
  stats_orders: "orders",
  stats_orders_and_count: "{orders} orders · {count} records",
  stats_count_unit: "records",

  common_more: "More",
  common_edit: "Edit",
  common_delete: "Delete",
  common_income: "Income",
  common_expense: "Expense",
  common_transactions_count: "{n} transactions",
  common_count_unit: "records",
  common_back: "Back",

  auth_title: "Account Login",
  auth_desc: "Sign in with Google to backup data to Google Drive and sync across devices.",
  auth_google_login: "Sign in with Google",
  auth_loading: "Signing in...",
  auth_login_failed: "Login failed",
  auth_google_not_loaded: "Google service not loaded yet",
  auth_no_client_id: "Google Client ID not configured",
  auth_logged_in: "(Logged in)",
  auth_google_user: "Google User",
  auth_storage: "Data Storage",
  auth_local: "Local",
  auth_cloud: "Cloud",
  auth_local_desc: "Data stored only on this device",
  auth_cloud_desc: "Data synced to Google Drive, accessible across devices",
  auth_backup: "Backup",
  auth_restore: "Restore",
  auth_uploading: "Uploading...",
  auth_restoring: "Restoring from cloud...",
  auth_backup_done: "✓ Backed up to Google Drive",
  auth_restore_done: "✓ Restored from Google Drive",
  auth_restore_confirm: "Restore will overwrite all current data. Are you sure?",

  membership_title: "Membership Plans",
  membership_free: "Free",
  membership_pro: "Pro",
  membership_business: "Business",
  membership_current_plan: "Current Plan",
  membership_upgrade: "Upgrade",
  membership_monthly: "/mo",
  membership_expires: "Expires",
  membership_free_forever: "Free Forever",
  membership_cancel: "Cancel Subscription",
  membership_features: "Features",
  membership_feature_unlimited: "Unlimited",
  membership_feature_cloud_backup: "Cloud Backup",
  membership_feature_advanced_reports: "Advanced Reports",
  membership_feature_custom_categories: "Custom Categories",
  membership_feature_export: "Export Data",
  membership_feature_multi_device: "Multi-device Sync",
  membership_feature_max_products: "Up to {n} products",
  membership_feature_max_markets: "Up to {n} markets",
  membership_feature_max_transactions: "{n} transactions/month",
  membership_demo_badge: "Demo",
  membership_coming_soon: "Coming Soon",
  membership_current: "Current",
  membership_select_plan: "Select Plan",

  settings_title: "Settings",
  settings_test_account: "Test Account",
  settings_logged_in: "Logged in as test account",
  settings_logout: "Logout",
  settings_preferences: "Preferences",
  settings_currency: "Currency",
  settings_language: "Language",
  settings_haptic: "Haptic Feedback",
  settings_haptic_desc: "Vibrate when tapping buttons, swiping products",
  settings_haptic_strength: "Strength",
  settings_haptic_light: "Light",
  settings_haptic_medium: "Medium",
  settings_haptic_strong: "Strong",
  settings_haptic_test: "Test Vibration",
  settings_dark_mode: "Dark Mode",
  settings_dark_mode_desc: "Eye-friendly mode for night use",
  settings_data_management: "Data Management",
  settings_export: "Export Data",
  settings_export_csv: "CSV",
  settings_export_json: "JSON",
  settings_export_excel: "Excel compatible",
  settings_export_backup: "Full backup",
  settings_clear_data: "Clear Data",
  settings_clear_desc: "Delete all transaction records",
  settings_clear_confirm: "Confirm Clear",
  settings_clear_confirm_title: "Clear all data?",
  settings_clear_confirm_msg: "This will delete {n} transaction records and all product data. This cannot be undone.",
  settings_cleared: "All transaction records cleared",
  settings_logout_confirm: "Are you sure you want to log out of the test account?",
  settings_app_update: "App Update",
  settings_current_version: "Current Version",
  settings_recheck: "Recheck",
  settings_manual_check: "Manual Check",
  settings_download_update: "Download Update",
  settings_latest: "Up to date",
  settings_new_version: "New version available",
  settings_published: "Published",
  settings_check_failed: "Check failed",
  settings_checking: "Checking for updates...",
  settings_retry: "Retry",
  settings_downloading: "Downloading...",
  settings_download_complete: "Download complete! Tap notification to install",
  settings_keep_app_open: "Please keep the app open",
  settings_download_failed: "Download failed",
  settings_open_browser: "Opened browser to download",
  settings_version_info: "Version Info",
  settings_export_count: "transactions",
  settings_about: "About",
  settings_developer: "Developer",
  settings_tech_stack: "Tech Stack",
  settings_update_date: "Update Date",
  settings_version_tag: "Version Tag",
  settings_no_export: "No transactions to export",

  login_title: "MarketLedger",
  login_subtitle: "MarketLedger · Test Version",
  login_test_account: "Login with Test Account",
  login_test_desc: "Only for users with test accounts",
  login_username: "Username",
  login_password: "Password",
  login_enter_username: "Enter username",
  login_enter_password: "Enter password",
  login_button: "Login",
  login_verifying: "Verifying...",
  login_error: "Invalid username or password",
  login_error_empty: "Please enter username and password",
  login_warning: "This is a test version, only for invited testers. Do not distribute.",

  language_title: "Select Language",
  language_desc: "Choose your language, you can change it anytime in Settings",
  language_confirm: "Confirm",

  currency_title: "Select Your Currency",
  currency_desc: "Choose your main currency, you can change it anytime in Settings",
  currency_confirm: "Confirm",
  currency_default: "Default currency",

  cat_sales: "Sales",
  cat_other_income: "Other Income",
  cat_rent: "Booth Fee",
  cat_stock: "Stock",
  cat_transport: "Transport",
  cat_food: "Food",
  cat_packaging: "Packaging",
  cat_misc: "Misc",
  cat_other_expense: "Other",

  pay_cash: "Cash",
  pay_credit_card: "Credit Card",
  pay_apple_pay: "Apple Pay",
  pay_google_pay: "Google Pay",
  pay_bank_transfer: "Bank Transfer",
  pay_paypal: "PayPal",
  pay_payme: "PayMe",
  pay_alipayhk: "AlipayHK",
  pay_wechat_pay: "WeChat Pay",
  pay_fps: "FPS",
  pay_octopus: "Octopus",
  pay_line_pay: "LINE Pay",
  pay_jkopay: "JKO Pay",
  pay_truemoney: "TrueMoney",
  pay_tng: "Touch 'n Go",
  pay_grabpay: "GrabPay",
  pay_duitnow: "DuitNow",
  pay_promptpay: "PromptPay",
  pay_other: "Other",
  pay_unknown: "Unknown",
  pay_custom: "Custom",

  paycat_common: "Common",
  paycat_hk: "Hong Kong",
  paycat_tw: "Taiwan",
  paycat_sea: "Southeast Asia",

  products_no_items: "No products yet",
  products_no_items_hint: "Switch to Product Management to create products",
  products_selected_count: "{n} selected",
  products_select_hint: "Tap other products to add · Tap blank or Cancel to exit",
  products_long_press_hint: "Long press any product to enter multi-select mode · Select multiple to delete · Tap blank or Cancel to exit",
  products_delete_selected: "Delete ({n})",
  products_delete_confirm: "Delete {n} selected products?",
  products_name_required: "Please enter product name",
  products_price_required: "Please enter a valid price",
  products_name_placeholder: "Product Name",
  products_price_placeholder: "Price",
  products_unit_placeholder: "Unit",
  products_color_label: "Button color (optional, for grouping)",
  products_count: "{n} products",
  products_view_grid: "Grid View",
  products_view_list: "List View",
  products_unit_default: "pcs",

  record_amount_required: "Please enter an amount",
  record_tap_hint: "Tap product to record sale",
  record_confirm: "Confirm",
  record_close_notification: "Close notification",
  record_unit_price: "Unit Price",
  record_cancelled: "Cancelled",
  record_sort_hint: "Long press to sort",
  record_sorting: "Drag to sort",
  record_grayscale: "Grayscale",
  record_selected: "Selected",

  demo_cookie: "Handmade Cookies",
  demo_jewelry: "Handmade Jewelry",
  demo_jam: "Jam",
  demo_coffee: "Coffee",
  demo_cookie_note: "Sold cookies",
  demo_jewelry_note: "Sold jewelry",
  demo_jam_note: "Sold jam",
  demo_stock_note: "Stock: flour, butter",
  demo_packaging_note: "Packaging boxes",
  demo_rent_note: "PMQ booth fee",
  demo_unit_pack: "pack",
  demo_unit_piece: "pc",
  demo_unit_bottle: "bottle",
  demo_unit_cup: "cup",

  markets_weekday_sun: "Sun",
  markets_weekday_mon: "Mon",
  markets_weekday_tue: "Tue",
  markets_weekday_wed: "Wed",
  markets_weekday_thu: "Thu",
  markets_weekday_fri: "Fri",
  markets_weekday_sat: "Sat",
  markets_month_prefix: "",
  markets_today: "Today",
  markets_yesterday: "Yesterday",
  markets_select_start: "Tap to select start date",
  markets_select_end_hint: "Tap again to cancel, or tap end date",
  markets_end_before_start: "End date cannot be before start date",

  record_payment_add_title: "Add Payment Method",
  record_payment_name_label: "Name",
  record_payment_name_placeholder: "e.g. Octopus, PayPal",
  record_payment_icon_label: "Icon",
  record_payment_color_label: "Color",
  record_payment_add_button: "Add",
  record_payment_name_required: "Please enter a name",

  settings_err_rate_limit: "GitHub API rate limited, please try again later",
  settings_err_no_release: "No releases published yet",
  settings_err_check_failed: "Check failed",

  date_today: "Today",
  date_yesterday: "Yesterday",
  date_year: "",
  time_format: "en-US",
};

// Japanese
const ja: Translations = {
  tab_home: "概況",
  tab_record: "記帳",
  tab_markets: "市集",
  tab_transactions: "記録",
  tab_stats: "レポート",
  tab_settings: "設定",

  loading: "読み込み中...",
  confirm: "確認",
  cancel: "キャンセル",
  delete: "削除",
  edit: "編集",
  save: "保存",
  add: "追加",
  search: "検索",
  today: "今日",
  week: "今週",
  month: "今月",
  all: "全て",
  none: "なし",
  total: "合計",
  subtotal: "小計",

  home_today_overview: "今日の概況",
  home_today_profit: "今日の純利益",
  home_income: "収入",
  home_expense: "支出",
  home_transactions: "取引数",
  home_avg_order: "平均客単価",
  home_profit: "利益",
  home_today_records: "今日の記録",
  home_no_transactions: "今日の取引はありません",
  home_category: "カテゴリー",
  home_view_all: "すべて表示",

  record_title: "記帳",
  record_payment_method: "支払い方法",
  record_tap_to_record: "⚡ 商品をタップして記録",
  record_long_press_hint: "長押しで数量調整 · ←入力 · →キャンセル",
  record_undo: "取り消す",
  record_undo_last: "前の取引を取り消す",
  record_enter_qty: "数量入力",
  record_manual_entry: "手動入力（カスタム金額 / 支出 / カテゴリー）",
  record_expense: "💸 支出",
  record_income: "💰 収入",
  record_amount: "金額",
  record_category: "カテゴリー",
  record_market: "市集",
  record_no_market: "🌐 市集指定なし",
  record_note_optional: "メモ（任意）",
  record_complete: "✓ 記帳完了",
  record_order_details: "注文詳細",
  record_new_order: "新規注文",
  record_qty: "数量入力",
  record_modify_item: "項目編集",
  record_note_label: "メモ（任意）",
  record_no_products: "商品がありません",
  record_create_products: "「商品」タブで商品を作成",

  products_title: "商品",
  products_total: "計",
  products_add: "商品追加",
  products_edit: "編集",
  products_name: "商品名",
  products_price: "単価",
  products_unit: "単位",
  products_color: "ボタンカラー（任意、視覚グループ用）",
  products_color_optional: "ボタンカラー（任意）",
  products_save: "商品保存",
  products_save_edit: "変更保存",
  products_add_product: "商品追加",
  products_edit_product: "商品編集",

  transactions_title: "取引履歴",
  transactions_today: "今日",
  transactions_this_week: "今週",
  transactions_this_month: "今月",
  transactions_all: "全て",
  transactions_today_profit: "今日の純利益",
  transactions_records: "取引記録",
  transactions_groups: "件",
  transactions_no_records: "取引記録がありません",
  transactions_no_records_hint: "「記帳」ページで記録を始めましょう",
  transactions_no_match: "条件に一致する記録がありません",
  transactions_no_match_hint: "他の検索条件を試してください",
  transactions_search_placeholder: "商品名またはメモを検索...",
  transactions_order: "商品",
  transactions_items: "点",
  transactions_summary: "合計",

  markets_title: "市集カレンダー",
  markets_subtitle: "日付をタップで記録表示 · 市集イベント表示",
  markets_add: "追加",
  markets_upcoming: "予定",
  markets_month_events: "市集",
  markets_no_events: "全ての支払い方法が表示されています",
  markets_date_range: "期間",
  markets_market_name: "市集名 *",
  markets_location: "場所",
  markets_booth_fee: "ブース料金",
  markets_booth_number: "ブース番号",
  markets_business_hours: "営業時間",
  markets_color: "カラー",
  markets_notes: "メモ",
  markets_auto_fee: "ブース料金の自動記帳",
  markets_auto_fee_desc: "毎日ブース料金を自動で支出に追加",
  markets_add_market: "市集追加",
  markets_edit_market: "市集編集",
  markets_per_day: "1日あたり",
  markets_total_mode: "合計",
  markets_sticky_notes: "付箋",
  markets_sticky_add: "追加",
  markets_sticky_placeholder: "メモを書く...",
  markets_sticky_empty: "「追加」をタップして付箋を作成",
  markets_sticky_paste: "貼る",
  markets_no_transactions_day: "この日の取引はありません",

  stats_title: "統計レポート",
  stats_this_week: "今週",
  stats_this_month: "今月",
  stats_income: "収入",
  stats_expense: "支出",
  stats_net_profit: "純利益",
  stats_avg_order: "平均客単価",
  stats_daily_trend: "日別利益推移",
  stats_category_stats: "カテゴリー別統計",
  stats_no_data: "データなし",
  stats_orders: "件",
  stats_orders_and_count: "{orders} 件 · {count} 件",
  stats_count_unit: "件",

  common_more: "もっと見る",
  common_edit: "編集",
  common_delete: "削除",
  common_income: "収入",
  common_expense: "支出",
  common_transactions_count: "{n} 件の取引",
  common_count_unit: "件",
  common_back: "戻る",

  auth_title: "アカウントログイン",
  auth_desc: "Google アカウントでログインすると、Google Drive にデータをバックアップし、デバイス間で同期できます。",
  auth_google_login: "Google でログイン",
  auth_loading: "ログイン中...",
  auth_login_failed: "ログイン失敗",
  auth_google_not_loaded: "Google サービスが読み込まれていません",
  auth_no_client_id: "Google Client ID が設定されていません",
  auth_logged_in: "(ログイン済み)",
  auth_google_user: "Google ユーザー",
  auth_storage: "データ保存",
  auth_local: "ローカル",
  auth_cloud: "クラウド",
  auth_local_desc: "データはこのデバイスにのみ保存",
  auth_cloud_desc: "データは Google Drive に同期、デバイス間でアクセス可能",
  auth_backup: "バックアップ",
  auth_restore: "復元",
  auth_uploading: "アップロード中...",
  auth_restoring: "クラウドから復元中...",
  auth_backup_done: "✓ Google Drive にバックアップしました",
  auth_restore_done: "✓ Google Drive から復元しました",
  auth_restore_confirm: "復元すると現在のすべてのデータが上書きされます。よろしいですか？",

  membership_title: "会員プラン",
  membership_free: "無料版",
  membership_pro: "プロ版",
  membership_business: "ビジネス版",
  membership_current_plan: "現在のプラン",
  membership_upgrade: "アップグレード",
  membership_monthly: "/月",
  membership_expires: "有効期限",
  membership_free_forever: "永久無料",
  membership_cancel: "サブスク解約",
  membership_features: "機能",
  membership_feature_unlimited: "無制限",
  membership_feature_cloud_backup: "クラウドバックアップ",
  membership_feature_advanced_reports: "詳細レポート",
  membership_feature_custom_categories: "カスタムカテゴリー",
  membership_feature_export: "データエクスポート",
  membership_feature_multi_device: "マルチデバイス同期",
  membership_feature_max_products: "最大{n}商品",
  membership_feature_max_markets: "最大{n}市場",
  membership_feature_max_transactions: "月{n}件",
  membership_demo_badge: "デモ",
  membership_coming_soon: "近日公開",
  membership_current: "現在",
  membership_select_plan: "プランを選択",

  settings_title: "設定",
  settings_test_account: "テストアカウント",
  settings_logged_in: "テストアカウントでログイン中",
  settings_logout: "ログアウト",
  settings_preferences: "基本設定",
  settings_currency: "通貨",
  settings_language: "言語",
  settings_haptic: "振動フィードバック",
  settings_haptic_desc: "ボタンタップ、商品スワイドで振動",
  settings_haptic_strength: "振動の強さ",
  settings_haptic_light: "弱",
  settings_haptic_medium: "中",
  settings_haptic_strong: "強",
  settings_haptic_test: "テスト振動",
  settings_dark_mode: "ダークモード",
  settings_dark_mode_desc: "夜間使用に最適なアイモード",
  settings_data_management: "データ管理",
  settings_export: "データエクスポート",
  settings_export_csv: "CSV",
  settings_export_json: "JSON",
  settings_export_excel: "Excel対応",
  settings_export_backup: "完全バックアップ",
  settings_clear_data: "データ削除",
  settings_clear_desc: "すべての取引記録を削除",
  settings_clear_confirm: "削除確認",
  settings_clear_confirm_title: "すべてのデータを削除しますか？",
  settings_clear_confirm_msg: "{n} 件の取引記録とすべての商品データを削除します。この操作は元に戻せません。",
  settings_cleared: "すべての取引記録を削除しました",
  settings_logout_confirm: "テストアカウントからログアウトしますか？",
  settings_app_update: "アプリ更新",
  settings_current_version: "現在のバージョン",
  settings_recheck: "再確認",
  settings_manual_check: "手動確認",
  settings_download_update: "更新をダウンロード",
  settings_latest: "最新です",
  settings_new_version: "新バージョンがあります",
  settings_published: "公開日",
  settings_check_failed: "確認失敗",
  settings_checking: "更新を確認中...",
  settings_retry: "再試行",
  settings_downloading: "ダウンロード中...",
  settings_download_complete: "ダウンロード完了！通知をタップしてインストール",
  settings_keep_app_open: "アプリを開いたままにしてください",
  settings_download_failed: "ダウンロード失敗",
  settings_open_browser: "ブラウザでダウンロードを開きました",
  settings_version_info: "バージョン情報",
  settings_export_count: "件",
  settings_about: "について",
  settings_developer: "開発者",
  settings_tech_stack: "技術スタック",
  settings_update_date: "更新日",
  settings_version_tag: "バージョンタグ",
  settings_no_export: "エクスポートする取引記録がありません",

  login_title: "MarketLedger",
  login_subtitle: "MarketLedger · テスト版",
  login_test_account: "テストアカウントでログイン",
  login_test_desc: "テストアカウントを持つユーザーのみ",
  login_username: "アカウント",
  login_password: "パスワード",
  login_enter_username: "アカウントを入力",
  login_enter_password: "パスワードを入力",
  login_button: "ログイン",
  login_verifying: "認証中...",
  login_error: "アカウントまたはパスワードが間違っています",
  login_error_empty: "アカウントとパスワードを入力してください",
  login_warning: "本アプリはテスト版であり、招待されたテスターのみが使用できます。無断転載禁止。",

  language_title: "言語を選択",
  language_desc: "使用する言語を選択してください。設定でいつでも変更できます",
  language_confirm: "確認",

  currency_title: "通貨を選択",
  currency_desc: "主に使用する通貨を選択してください。設定でいつでも変更できます",
  currency_confirm: "確認",
  currency_default: "デフォルト通貨",

  cat_sales: "販売",
  cat_other_income: "その他収入",
  cat_rent: "ブース料金",
  cat_stock: "仕入れ",
  cat_transport: "交通費",
  cat_food: "飲食費",
  cat_packaging: "包装資材",
  cat_misc: "雑費",
  cat_other_expense: "その他",

  pay_cash: "現金",
  pay_credit_card: "クレジットカード",
  pay_apple_pay: "Apple Pay",
  pay_google_pay: "Google Pay",
  pay_bank_transfer: "銀行振込",
  pay_paypal: "PayPal",
  pay_payme: "PayMe",
  pay_alipayhk: "AlipayHK",
  pay_wechat_pay: "WeChat Pay",
  pay_fps: "FPS",
  pay_octopus: "オクトパス",
  pay_line_pay: "LINE Pay",
  pay_jkopay: "街口支付",
  pay_truemoney: "TrueMoney",
  pay_tng: "Touch 'n Go",
  pay_grabpay: "GrabPay",
  pay_duitnow: "DuitNow",
  pay_promptpay: "PromptPay",
  pay_other: "その他",
  pay_unknown: "不明",
  pay_custom: "カスタム",

  paycat_common: "共通",
  paycat_hk: "香港",
  paycat_tw: "台湾",
  paycat_sea: "東南アジア",

  products_no_items: "商品がありません",
  products_no_items_hint: "「商品管理」に切り替えて商品を作成してください",
  products_selected_count: "{n} 個選択中",
  products_select_hint: "他の商品をタップして選択 · 空白またはキャンセルで終了",
  products_long_press_hint: "商品を長押しして複数選択モードへ · 複数選択して削除可能 · 空白またはキャンセルで終了",
  products_delete_selected: "削除 ({n})",
  products_delete_confirm: "選択した {n} 個の商品を削除しますか？",
  products_name_required: "商品名を入力してください",
  products_price_required: "有効な単価を入力してください",
  products_name_placeholder: "商品名",
  products_price_placeholder: "単価",
  products_unit_placeholder: "単位",
  products_color_label: "ボタンカラー（任意、グループ識別用）",
  products_count: "{n} 個の商品",
  products_view_grid: "グリッド表示",
  products_view_list: "リスト表示",
  products_unit_default: "個",

  record_amount_required: "金額を入力してください",
  record_tap_hint: "商品をタップして販売を記録",
  record_confirm: "確認",
  record_close_notification: "通知を閉じる",
  record_unit_price: "単価",
  record_cancelled: "キャンセル",
  record_sort_hint: "長押しで並べ替え",
  record_sorting: "ドラッグ中",
  record_grayscale: "グレースケール",
  record_selected: "選択済み",

  demo_cookie: "手作りクッキー",
  demo_jewelry: "手作りアクセサリー",
  demo_jam: "ジャム",
  demo_coffee: "コーヒー",
  demo_cookie_note: "クッキー販売",
  demo_jewelry_note: "アクセサリー販売",
  demo_jam_note: "ジャム販売",
  demo_stock_note: "仕入れ：小麦粉、バター",
  demo_packaging_note: "パッケージ箱",
  demo_rent_note: "PMQ ブース料金",
  demo_unit_pack: "袋",
  demo_unit_piece: "個",
  demo_unit_bottle: "瓶",
  demo_unit_cup: "杯",

  markets_weekday_sun: "日",
  markets_weekday_mon: "月",
  markets_weekday_tue: "火",
  markets_weekday_wed: "水",
  markets_weekday_thu: "木",
  markets_weekday_fri: "金",
  markets_weekday_sat: "土",
  markets_month_prefix: "",
  markets_today: "今日",
  markets_yesterday: "昨日",
  markets_select_start: "開始日を選択",
  markets_select_end_hint: "もう一度タップでキャンセル、または終了日をタップ",
  markets_end_before_start: "終了日は開始日より前にはできません",

  record_payment_add_title: "支払い方法を追加",
  record_payment_name_label: "名称",
  record_payment_name_placeholder: "例：オクトパス、PayPal",
  record_payment_icon_label: "アイコン",
  record_payment_color_label: "カラー",
  record_payment_add_button: "追加",
  record_payment_name_required: "名称を入力してください",

  settings_err_rate_limit: "GitHub APIのアクセス頻度が制限されています。後でもう一度お試しください",
  settings_err_no_release: "まだリリースが公開されていません",
  settings_err_check_failed: "確認失敗",

  date_today: "今日",
  date_yesterday: "昨日",
  date_year: "年",
  time_format: "ja-JP",
};
// Korean
const ko: Translations = {
  tab_home: "개요",
  tab_record: "기장",
  tab_markets: "시장",
  tab_transactions: "기록",
  tab_stats: "보고서",
  tab_settings: "설정",

  loading: "로딩 중...",
  confirm: "확인",
  cancel: "취소",
  delete: "삭제",
  edit: "편집",
  save: "저장",
  add: "추가",
  search: "검색",
  today: "오늘",
  week: "이번 주",
  month: "이번 달",
  all: "전체",
  none: "없음",
  total: "합계",
  subtotal: "소계",

  home_today_overview: "오늘 개요",
  home_today_profit: "오늘 순이익",
  home_income: "수입",
  home_expense: "지출",
  home_transactions: "거래 수",
  home_avg_order: "평균 객단가",
  home_profit: "이익",
  home_today_records: "오늘 기록",
  home_no_transactions: "오늘 거래가 없습니다",
  home_category: "카테고리",
  home_view_all: "전체 보기",

  record_title: "기장",
  record_payment_method: "결제 수단",
  record_tap_to_record: "⚡ 상품을 탭하여 기록",
  record_long_press_hint: "길게 눌러 수량 조정 · ←입력 · →취소",
  record_undo: "실행 취소",
  record_undo_last: "이전 거래 취소",
  record_enter_qty: "수량 입력",
  record_manual_entry: "수동 입력 (사용자 정의 금액 / 지출 / 카테고리)",
  record_expense: "💸 지출",
  record_income: "💰 수입",
  record_amount: "금액",
  record_category: "카테고리",
  record_market: "시장",
  record_no_market: "🌐 시장 미지정",
  record_note_optional: "메모 (선택)",
  record_complete: "✓ 기장 완료",
  record_order_details: "주문 내역",
  record_new_order: "새 주문",
  record_qty: "수량 입력",
  record_modify_item: "항목 수정",
  record_note_label: "메모 (선택)",
  record_no_products: "상품 없음",
  record_create_products: "「상품」 탭에서 카탈로그 생성",

  products_title: "상품",
  products_total: "총",
  products_add: "상품 추가",
  products_edit: "수정",
  products_name: "상품명",
  products_price: "단가",
  products_unit: "단위",
  products_color: "버튼 색상 (선택, 시각적 그룹용)",
  products_color_optional: "버튼 색상 (선택)",
  products_save: "상품 저장",
  products_save_edit: "수정 저장",
  products_add_product: "상품 추가",
  products_edit_product: "상품 편집",

  transactions_title: "거래 기록",
  transactions_today: "오늘",
  transactions_this_week: "이번 주",
  transactions_this_month: "이번 달",
  transactions_all: "전체",
  transactions_today_profit: "오늘 순이익",
  transactions_records: "거래 기록",
  transactions_groups: "건",
  transactions_no_records: "거래 기록이 없습니다",
  transactions_no_records_hint: "「기록」 페이지에서 기록을 시작하세요",
  transactions_no_match: "조건에 맞는 기록이 없습니다",
  transactions_no_match_hint: "다른 검색 조건을 시도해 보세요",
  transactions_search_placeholder: "상품명 또는 메모 검색...",
  transactions_order: "상품",
  transactions_items: "개",
  transactions_summary: "합계",

  markets_title: "시장 캘린더",
  markets_subtitle: "날짜 탭으로 기록 보기 · 시장 이벤트 보기",
  markets_add: "추가",
  markets_upcoming: "예정",
  markets_month_events: "시장",
  markets_no_events: "모든 결제 수단이 표시됨",
  markets_date_range: "기간",
  markets_market_name: "시장명 *",
  markets_location: "위치",
  markets_booth_fee: "부스 비용",
  markets_booth_number: "부스 번호",
  markets_business_hours: "영업 시간",
  markets_color: "색상",
  markets_notes: "메모",
  markets_auto_fee: "부스 비용 자동 기장",
  markets_auto_fee_desc: "매일 부스 비용을 자동으로 지출에 추가",
  markets_add_market: "시장 추가",
  markets_edit_market: "시장 편집",
  markets_per_day: "하루당",
  markets_total_mode: "합계",
  markets_sticky_notes: "메모지",
  markets_sticky_add: "추가",
  markets_sticky_placeholder: "메모를 작성...",
  markets_sticky_empty: "「추가」를 탭하여 메모지 작성",
  markets_sticky_paste: "붙이기",
  markets_no_transactions_day: "이 날의 거래가 없습니다",

  stats_title: "통계 보고서",
  stats_this_week: "이번 주",
  stats_this_month: "이번 달",
  stats_income: "수입",
  stats_expense: "지출",
  stats_net_profit: "순이익",
  stats_avg_order: "평균 객단가",
  stats_daily_trend: "일일 이익 추이",
  stats_category_stats: "카테고리 통계",
  stats_no_data: "데이터 없음",
  stats_orders: "건",
  stats_orders_and_count: "{orders}건 · {count}건",
  stats_count_unit: "건",

  common_more: "더보기",
  common_edit: "편집",
  common_delete: "삭제",
  common_income: "수입",
  common_expense: "지출",
  common_transactions_count: "{n}건 거래",
  common_count_unit: "건",
  common_back: "뒤로",

  auth_title: "계정 로그인",
  auth_desc: "Google 계정으로 로그인하면 Google Drive에 데이터를 백업하고 기기 간 동기화할 수 있습니다.",
  auth_google_login: "Google로 로그인",
  auth_loading: "로그인 중...",
  auth_login_failed: "로그인 실패",
  auth_google_not_loaded: "Google 서비스가 아직 로드되지 않았습니다",
  auth_no_client_id: "Google Client ID가 설정되지 않았습니다",
  auth_logged_in: "(로그인됨)",
  auth_google_user: "Google 사용자",
  auth_storage: "데이터 저장",
  auth_local: "로컬",
  auth_cloud: "클라우드",
  auth_local_desc: "데이터는 이 기기에만 저장됩니다",
  auth_cloud_desc: "데이터는 Google Drive에 동기화되어 기기 간 접근 가능",
  auth_backup: "백업",
  auth_restore: "복원",
  auth_uploading: "업로드 중...",
  auth_restoring: "클라우드에서 복원 중...",
  auth_backup_done: "✓ Google Drive에 백업됨",
  auth_restore_done: "✓ Google Drive에서 복원됨",
  auth_restore_confirm: "복원하면 현재 모든 데이터가 덮어씌워집니다. 계속하시겠습니까?",

  membership_title: "멤버십 플랜",
  membership_free: "무료",
  membership_pro: "프로",
  membership_business: "비즈니스",
  membership_current_plan: "현재 플랜",
  membership_upgrade: "업그레이드",
  membership_monthly: "/월",
  membership_expires: "만료일",
  membership_free_forever: "영구 무료",
  membership_cancel: "구독 취소",
  membership_features: "기능",
  membership_feature_unlimited: "무제한",
  membership_feature_cloud_backup: "클라우드 백업",
  membership_feature_advanced_reports: "고급 보고서",
  membership_feature_custom_categories: "맞춤 카테고리",
  membership_feature_export: "데이터 내보내기",
  membership_feature_multi_device: "다중 기기 동기화",
  membership_feature_max_products: "최대 {n}개 상품",
  membership_feature_max_markets: "최대 {n}개 시장",
  membership_feature_max_transactions: "월 {n}건 거래",
  membership_demo_badge: "데모",
  membership_coming_soon: "출시 예정",
  membership_current: "현재",
  membership_select_plan: "플랜 선택",

  settings_title: "설정",
  settings_test_account: "테스트 계정",
  settings_logged_in: "테스트 계정으로 로그인됨",
  settings_logout: "로그아웃",
  settings_preferences: "환경설정",
  settings_currency: "통화",
  settings_language: "언어",
  settings_haptic: "진동 피드백",
  settings_haptic_desc: "버튼 탭, 상품 스와이프 시 진동",
  settings_haptic_strength: "진동 강도",
  settings_haptic_light: "약",
  settings_haptic_medium: "중",
  settings_haptic_strong: "강",
  settings_haptic_test: "진동 테스트",
  settings_dark_mode: "다크 모드",
  settings_dark_mode_desc: "야간 사용에 편한 눈 보호 모드",
  settings_data_management: "데이터 관리",
  settings_export: "데이터 내보내기",
  settings_export_csv: "CSV",
  settings_export_json: "JSON",
  settings_export_excel: "Excel 호환",
  settings_export_backup: "전체 백업",
  settings_clear_data: "데이터 삭제",
  settings_clear_desc: "모든 거래 기록 삭제",
  settings_clear_confirm: "삭제 확인",
  settings_clear_confirm_title: "모든 데이터를 삭제하시겠습니까?",
  settings_clear_confirm_msg: "{n}건의 거래 기록과 모든 상품 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.",
  settings_cleared: "모든 거래 기록이 삭제되었습니다",
  settings_logout_confirm: "테스트 계정에서 로그아웃하시겠습니까?",
  settings_app_update: "앱 업데이트",
  settings_current_version: "현재 버전",
  settings_recheck: "재확인",
  settings_manual_check: "수동 확인",
  settings_download_update: "업데이트 다운로드",
  settings_latest: "최신 버전입니다",
  settings_new_version: "새 버전이 있습니다",
  settings_published: "게시일",
  settings_check_failed: "확인 실패",
  settings_checking: "업데이트 확인 중...",
  settings_retry: "다시 시도",
  settings_downloading: "다운로드 중...",
  settings_download_complete: "다운로드 완료! 알림을 탭하여 설치",
  settings_keep_app_open: "앱을 열어둔 상태로 유지해 주세요",
  settings_download_failed: "다운로드 실패",
  settings_open_browser: "브라우저에서 다운로드를 열었습니다",
  settings_version_info: "버전 정보",
  settings_export_count: "건",
  settings_about: "정보",
  settings_developer: "개발자",
  settings_tech_stack: "기술 스택",
  settings_update_date: "업데이트 날짜",
  settings_version_tag: "버전 태그",
  settings_no_export: "내보낼 거래 기록이 없습니다",

  login_title: "MarketLedger",
  login_subtitle: "MarketLedger · 테스트 버전",
  login_test_account: "테스트 계정으로 로그인",
  login_test_desc: "테스트 계정을 가진 사용자만 사용 가능",
  login_username: "계정",
  login_password: "비밀번호",
  login_enter_username: "계정 입력",
  login_enter_password: "비밀번호 입력",
  login_button: "로그인",
  login_verifying: "인증 중...",
  login_error: "계정 또는 비밀번호가 잘못되었습니다",
  login_error_empty: "계정과 비밀번호를 입력해 주세요",
  login_warning: "본 앱은 테스트 버전이며, 초대받은 테스터만 사용할 수 있습니다. 무단 배포 금지.",

  language_title: "언어 선택",
  language_desc: "사용할 언어를 선택하세요. 설정에서 언제든 변경할 수 있습니다",
  language_confirm: "확인",

  currency_title: "통화 선택",
  currency_desc: "주로 사용하는 통화를 선택하세요. 설정에서 언제든 변경할 수 있습니다",
  currency_confirm: "확인",
  currency_default: "기본 통화",

  cat_sales: "판매",
  cat_other_income: "기타 수입",
  cat_rent: "부스 비용",
  cat_stock: "매입",
  cat_transport: "교통비",
  cat_food: "식비",
  cat_packaging: "포장재",
  cat_misc: "잡비",
  cat_other_expense: "기타",

  pay_cash: "현금",
  pay_credit_card: "신용카드",
  pay_apple_pay: "Apple Pay",
  pay_google_pay: "Google Pay",
  pay_bank_transfer: "계좌이체",
  pay_paypal: "PayPal",
  pay_payme: "PayMe",
  pay_alipayhk: "AlipayHK",
  pay_wechat_pay: "WeChat Pay",
  pay_fps: "FPS",
  pay_octopus: "옥토퍼스",
  pay_line_pay: "LINE Pay",
  pay_jkopay: "JKO Pay",
  pay_truemoney: "TrueMoney",
  pay_tng: "Touch 'n Go",
  pay_grabpay: "GrabPay",
  pay_duitnow: "DuitNow",
  pay_promptpay: "PromptPay",
  pay_other: "기타",
  pay_unknown: "알 수 없음",
  pay_custom: "사용자 정의",

  paycat_common: "공통",
  paycat_hk: "홍콩",
  paycat_tw: "대만",
  paycat_sea: "동남아시아",

  products_no_items: "상품이 없습니다",
  products_no_items_hint: "「상품 관리」로 전환하여 상품을 만드세요",
  products_selected_count: "{n}개 선택됨",
  products_select_hint: "다른 상품을 탭하여 선택 · 빈 곳 또는 취소를 탭하여 종료",
  products_long_press_hint: "상품을 길게 눌러 다중 선택 모드로 진입 · 여러 상품을 선택하여 삭제 · 빈 곳 또는 취소를 탭하여 종료",
  products_delete_selected: "삭제 ({n})",
  products_delete_confirm: "선택한 {n}개의 상품을 삭제하시겠습니까?",
  products_name_required: "상품명을 입력해 주세요",
  products_price_required: "유효한 단가를 입력해 주세요",
  products_name_placeholder: "상품명",
  products_price_placeholder: "단가",
  products_unit_placeholder: "단위",
  products_color_label: "버튼 색상 (선택, 그룹 식별용)",
  products_count: "{n}개의 상품",
  products_view_grid: "그리드 보기",
  products_view_list: "리스트 보기",
  products_unit_default: "개",

  record_amount_required: "금액을 입력해 주세요",
  record_tap_hint: "상품을 탭하여 판매 기록",
  record_confirm: "확인",
  record_close_notification: "알림 닫기",
  record_unit_price: "단가",
  record_cancelled: "취소됨",
  record_sort_hint: "길게 눌러 정렬",
  record_sorting: "드래그 정렬 중",
  record_grayscale: "그레이스케일",
  record_selected: "선택됨",

  demo_cookie: "수제 쿠키",
  demo_jewelry: "수제 액세서리",
  demo_jam: "잼",
  demo_coffee: "커피",
  demo_cookie_note: "쿠키 판매",
  demo_jewelry_note: "액세서리 판매",
  demo_jam_note: "잼 판매",
  demo_stock_note: "매입: 밀가루, 버터",
  demo_packaging_note: "포장 상자",
  demo_rent_note: "PMQ 부스 비용",
  demo_unit_pack: "봉지",
  demo_unit_piece: "개",
  demo_unit_bottle: "병",
  demo_unit_cup: "잔",

  markets_weekday_sun: "일",
  markets_weekday_mon: "월",
  markets_weekday_tue: "화",
  markets_weekday_wed: "수",
  markets_weekday_thu: "목",
  markets_weekday_fri: "금",
  markets_weekday_sat: "토",
  markets_month_prefix: "",
  markets_today: "오늘",
  markets_yesterday: "어제",
  markets_select_start: "시작일을 선택하세요",
  markets_select_end_hint: "다시 탭하여 취소, 또는 종료일을 탭하세요",
  markets_end_before_start: "종료일은 시작일보다 이전일 수 없습니다",

  record_payment_add_title: "결제 방법 추가",
  record_payment_name_label: "이름",
  record_payment_name_placeholder: "예: 옥토퍼스, PayPal",
  record_payment_icon_label: "아이콘",
  record_payment_color_label: "색상",
  record_payment_add_button: "추가",
  record_payment_name_required: "이름을 입력해 주세요",

  settings_err_rate_limit: "GitHub API 접근 빈도가 제한되었습니다. 잠시 후 다시 시도해 주세요",
  settings_err_no_release: "아직 게시된 릴리스가 없습니다",
  settings_err_check_failed: "확인 실패",

  date_today: "오늘",
  date_yesterday: "어제",
  date_year: "년",
  time_format: "ko-KR",
};

export const TRANSLATIONS: Record<string, Translations> = {
  "zh-TW": zhTW,
  "zh-CN": zhCN,
  en,
  ja,
  ko,
};

// React hook
import { useAppStore } from "@/lib/store";

export function useT(): Translations {
  const language = useAppStore((s) => s.language);
  return TRANSLATIONS[language] || TRANSLATIONS["zh-TW"];
}

/**
 * 型別安全的 i18n label 解析 helper
 * 用於動態存取 t[key]，避免 (t as any)[key] 繞過型別檢查
 * 若 key 不存在則回傳 key 本身作為 fallback
 */
export function getLabel(t: Translations, key: string): string {
  return (t as any)[key] || key;
}

/**
 * 解析 demo 資料的 i18n key
 * 若字串是 demo_xxx 開頭，用當前語言解析；否則原樣回傳
 */
export function resolveDemoText(text: string | undefined, t: Translations): string {
  if (!text) return "";
  if (text.startsWith("demo_") || text.startsWith("cat_") || text.startsWith("pay_") || text.startsWith("paycat_")) {
    return getLabel(t, text);
  }
  return text;
}
