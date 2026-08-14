const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// react-native-fast-tflite loads .tflite files as bundled binary assets.
config.resolver.assetExts.push('tflite');

module.exports = config;
