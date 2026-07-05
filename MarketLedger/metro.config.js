const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 啟用 CSS 支援（expo-router 需要）
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

module.exports = config;
