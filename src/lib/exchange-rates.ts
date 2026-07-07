// 即時匯率服務
// 從免費 API（open.er-api.com）取得即時匯率
// 以港幣 (HKD) 為基準貨幣，所有交易金額以 HKD 儲存
// 顯示時根據用戶選擇的貨幣即時轉換

export const BASE_CURRENCY = "HKD";

// 匯率快取 key
const RATES_CACHE_KEY = "marketledger-exchange-rates";
const RATES_CACHE_DURATION = 60 * 60 * 1000; // 1 小時

interface CachedRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

// 從網路取得即時匯率（以 HKD 為基準）
export async function fetchExchangeRates(): Promise<Record<string, number> | null> {
  try {
    // open.er-api.com 是免費的匯率 API，不需要 API key
    const res = await fetch(`https://open.er-api.com/v6/latest/${BASE_CURRENCY}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.rates) throw new Error("No rates in response");

    // 快取到 localStorage
    const cached: CachedRates = {
      base: BASE_CURRENCY,
      rates: data.rates,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(cached));
    } catch {}

    return data.rates;
  } catch (e) {
    console.error("Failed to fetch exchange rates:", e);
    return null;
  }
}

// 取得快取的匯率（如果快取過期或不存在回傳 null）
export function getCachedRates(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(RATES_CACHE_KEY);
    if (!raw) return null;
    const cached: CachedRates = JSON.parse(raw);
    if (Date.now() - cached.timestamp > RATES_CACHE_DURATION) return null;
    if (cached.base !== BASE_CURRENCY) return null;
    return cached.rates;
  } catch {
    return null;
  }
}

// 取得匯率（先查快取，沒有就從網路取）
export async function getExchangeRates(): Promise<Record<string, number> | null> {
  const cached = getCachedRates();
  if (cached) return cached;
  return await fetchExchangeRates();
}

// 轉換金額：從 HKD 轉到目標貨幣
export function convertFromHKD(amountHKD: number, targetCurrency: string, rates: Record<string, number> | null): number {
  if (!rates) return amountHKD; // 沒有匯率就不轉換
  if (targetCurrency === BASE_CURRENCY) return amountHKD;
  const rate = rates[targetCurrency];
  if (!rate) return amountHKD;
  return amountHKD * rate;
}

// 轉換金額：從目標貨幣轉到 HKD（記帳時用）
export function convertToHKD(amount: number, fromCurrency: string, rates: Record<string, number> | null): number {
  if (!rates) return amount; // 沒有匯率就不轉換
  if (fromCurrency === BASE_CURRENCY) return amount;
  const rate = rates[fromCurrency];
  if (!rate) return amount;
  return amount / rate;
}

// 取得匯率顯示文字（例：「1 HKD = 4.2 TWD」）
export function getRateDisplay(targetCurrency: string, rates: Record<string, number> | null): string {
  if (!rates) return "";
  if (targetCurrency === BASE_CURRENCY) return "";
  const rate = rates[targetCurrency];
  if (!rate) return "";
  return `1 ${BASE_CURRENCY} = ${rate.toFixed(2)} ${targetCurrency}`;
}

// 格式化轉換後的金額（含符號）
import { CURRENCIES, type CurrencyCode } from "@/lib/store";

export function formatConverted(amountHKD: number, displayCurrency: CurrencyCode, rates: Record<string, number> | null): string {
  const converted = convertFromHKD(amountHKD, displayCurrency, rates);
  const { symbol, locale } = CURRENCIES[displayCurrency] || CURRENCIES.HKD;
  return `${symbol}${converted.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// React hook 版本 — 從 store 取匯率和貨幣，回傳 formatConverted 函數
import { useAppStore } from "@/lib/store";
import { useState, useEffect } from "react";

export function useFormatCurrency() {
  const currency = useAppStore((s) => s.currency);
  const exchangeRates = useAppStore((s) => s.exchangeRates);

  return (amountHKD: number) => formatConverted(amountHKD, currency, exchangeRates);
}
