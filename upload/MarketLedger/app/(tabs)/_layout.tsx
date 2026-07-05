import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { COLORS } from '../../src/constants/colors';

/** 底部 Tab 導航佈局 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.textInverse,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.divider,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 56,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: '首頁',
        }}
      />
      <Tabs.Screen
        name="expense"
        options={{
          title: '記帳',
        }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          title: '日報',
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: '市集',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
        }}
      />
    </Tabs>
  );
}
