const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Bundle the .tflite model as an asset.
config.resolver.assetExts.push('tflite');

module.exports = config;
