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
  record_no_products: string;
  record_create_products: string;

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

  // 日期/時間
  date_today: string;
  date_yesterday: string;
  date_year: string;
  time_format: string;
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

  date_today: "今日",
  date_yesterday: "昨日",
  date_year: "年",
  time_format: "zh-TW",
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
