const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Enable VisionCamera requirements
config.transformer.unstable_allowRequireContext = true;
config.resolver.sourceExts.push('cjs');
config.resolver.assetExts.push(
  'db', // For VisionCamera frame processors
  'mlmodel' // For ML models
);

module.exports = withNativeWind(config, { 
  input: './app/global.css',
  // Additional NativeWind config if needed
});