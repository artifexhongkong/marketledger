import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder, Vibration } from 'react-native';
import { useTransactionStore } from '../stores/transactionStore';
import { useSettingsStore } from '../stores/settingsStore';
import { formatCurrency } from '../utils/formatCurrency';
import { Product } from '../types';
import { PaymentMethod } from '../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/colors';

interface ProductButtonProps {
  product: Product;
  payment: PaymentMethod;
  currentMarketId: string | null;
  onRecorded: (txId: string, productName: string, amount: number, quantity: number) => void;
}

/**
 * 商品按鈕 — 支援：
 * - 點擊 = 記錄 1 筆
 * - 長按 400ms = 進入手勢模式
 * - 手勢模式中向上滑 = +1，向下滑 = −1
 * - 放開 = 記錄 quantity 筆
 */
export function ProductButton({ product, payment, currentMarketId, onRecorded }: ProductButtonProps) {
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const currency = useSettingsStore((s) => s.currency);

  const [quantity, setQuantity] = useState(1);
  const [gestureMode, setGestureMode] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [lastSwipeDir, setLastSwipeDir] = useState<'up' | 'down' | null>(null);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const gestureModeRef = useRef(false);
  const quantityRef = useRef(1);

  // 保持 refs 同步（PanResponder 閉包用）
  useEffect(() => {
    gestureModeRef.current = gestureMode;
  }, [gestureMode]);

  useEffect(() => {
    quantityRef.current = quantity;
  }, [quantity]);

  // 清理
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    };
  }, []);

  const recordTransaction = (qty: number) => {
    const txIds: string[] = [];
    for (let i = 0; i < qty; i++) {
      const txId = addTransaction({
        type: 'income',
        amount: product.price,
        currency,
        category: 'sales',
        paymentMethod: payment,
        productId: product.id,
        note: qty > 1 ? `${product.name} x${qty}` : product.name,
        marketId: currentMarketId || undefined,
      });
      txIds.push(txId);
    }
    setConfirming(true);
    setTimeout(() => setConfirming(false), 600);
    onRecorded(txIds[0], qty > 1 ? `${product.name} x${qty}` : product.name, product.price * qty, qty);
  };

  // PanResponder — 處理手勢模式的滑動（用 ref 取最新值避免閉包過時）
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureModeRef.current && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: (e) => {
        swipeStartRef.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
      },
      onPanResponderMove: (e, gestureState) => {
        if (!swipeStartRef.current) return;
        const deltaY = gestureState.dy;
        const SWIPE_THRESHOLD = 25;

        if (Math.abs(deltaY) >= SWIPE_THRESHOLD) {
          if (deltaY < 0) {
            setQuantity((q) => q + 1);
            setLastSwipeDir('up');
          } else {
            setQuantity((q) => Math.max(1, q - 1));
            setLastSwipeDir('down');
          }
          swipeStartRef.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
          Vibration.vibrate(15);
          setTimeout(() => setLastSwipeDir(null), 200);
        }
      },
      onPanResponderRelease: () => {
        if (gestureModeRef.current) {
          // 用 ref 取最新 quantity，避免閉包捕獲舊值
          recordTransaction(quantityRef.current);
          setGestureMode(false);
          setQuantity(1);
          swipeStartRef.current = null;
        }
      },
    })
  ).current;

  const handlePressIn = () => {
    // 啟動長按計時器
    longPressTimerRef.current = setTimeout(() => {
      setGestureMode(true);
      Vibration.vibrate(30);
    }, 400);
  };

  const handlePressOut = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    // 如果不是手勢模式（短按），由 onPress 處理
  };

  const handlePress = () => {
    // 短按記錄 1 筆（手勢模式不觸發）
    if (gestureModeRef.current) return;
    recordTransaction(1);
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        gestureMode && styles.buttonGesture,
        confirming && styles.buttonConfirming,
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
      {...panResponder.panHandlers}
    >
      {/* 確認狀態 */}
      {confirming && !gestureMode && (
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCircle}>
            <Text style={styles.confirmCheck}>✓</Text>
          </View>
        </View>
      )}

      {/* 手勢模式 */}
      {gestureMode && (
        <View style={styles.gestureOverlay}>
          <Text style={[
            styles.gestureQty,
            lastSwipeDir === 'up' && styles.gestureQtyUp,
            lastSwipeDir === 'down' && styles.gestureQtyDown,
            lastSwipeDir && styles.gestureQtyScale,
          ]}>
            ×{quantity}
          </Text>
          <Text style={styles.gestureTotal}>
            {formatCurrency(product.price * quantity, currency)}
          </Text>
          <View style={styles.gestureHints}>
            <Text style={[styles.gestureHint, lastSwipeDir === 'up' && styles.gestureHintActive]}>↑ +1</Text>
            <Text style={[styles.gestureHint, lastSwipeDir === 'down' && styles.gestureHintActive]}>↓ −1</Text>
          </View>
        </View>
      )}

      {/* 預設狀態 */}
      {!gestureMode && (
        <>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.productPrice}>{formatCurrency(product.price, currency)}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm + 2,
    minHeight: 68,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  buttonGesture: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '08',
    transform: [{ scale: 1.03 }],
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonConfirming: {
    borderColor: COLORS.income,
    backgroundColor: COLORS.incomeBg,
    transform: [{ scale: 0.97 }],
  },
  productName: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 16,
  },
  productPrice: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginTop: 4,
  },
  // 確認覆蓋
  confirmOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(209, 250, 229, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.income,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCheck: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 手勢覆蓋
  gestureOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.primary + '08',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gestureQty: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  gestureQtyUp: {
    color: COLORS.income,
  },
  gestureQtyDown: {
    color: COLORS.expense,
  },
  gestureQtyScale: {
    transform: [{ scale: 1.25 }],
  },
  gestureTotal: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  gestureHints: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    right: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gestureHint: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(107, 114, 128, 0.6)',
  },
  gestureHintActive: {
    color: COLORS.primary,
    transform: [{ scale: 1.1 }],
  },
});
