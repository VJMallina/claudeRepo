const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add module resolution alias for react-native-worklets
config.resolver.extraNodeModules = {
  'react-native-worklets': require.resolve('react-native-worklets-core'),
};

module.exports = config;
