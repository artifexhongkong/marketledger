import { Stack } from 'expo-router';

/** 根佈局 — Stack 導航（無 Tab，由 (tabs)/_layout 處理） */
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
