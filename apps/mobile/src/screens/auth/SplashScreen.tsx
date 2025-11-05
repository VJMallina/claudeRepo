import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { spacing, typography } from '@/theme/theme';
import { useAuthStore } from '@/store/authStore';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Splash'>;
};

export default function SplashScreen({ navigation }: SplashScreenProps) {
  const { isAuthenticated, checkAuthStatus } = useAuthStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check authentication status
      await checkAuthStatus();

      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate based on auth status
      if (isAuthenticated) {
        navigation.replace('Main' as any);
      } else {
        navigation.replace('Welcome' as any);
      }
    } catch (error) {
      console.error('Initialization error:', error);
      // Navigate to welcome on error
      navigation.replace('Welcome' as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.title}>SaveInvest</Text>
        <Text style={styles.subtitle}>Save Smart, Invest Smarter</Text>
      </View>

      <View style={styles.footer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 100,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight as any,
    color: '#fff',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: '#fff',
    opacity: 0.9,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl * 2,
  },
  loadingText: {
    marginTop: spacing.md,
    color: '#fff',
    fontSize: 14,
  },
});
