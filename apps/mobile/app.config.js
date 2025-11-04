export default {
  expo: {
    name: 'SaveInvest',
    slug: 'saveinvest',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    scheme: 'saveinvest',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#6200EE',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.saveinvest.app',
      infoPlist: {
        NSFaceIDUsageDescription:
          'We use Face ID to securely authenticate your identity and protect your financial information.',
        NSCameraUsageDescription:
          'We need camera access for KYC verification and liveness detection.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#6200EE',
      },
      package: 'com.saveinvest.app',
      permissions: ['USE_BIOMETRIC', 'USE_FINGERPRINT', 'CAMERA'],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: ['expo-router', 'expo-secure-store', 'expo-local-authentication'],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1',
    },
  },
};
