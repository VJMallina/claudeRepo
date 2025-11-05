import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { CustomButton } from '@/components';
import { spacing, typography } from '@/theme/theme';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  const features = [
    {
      icon: '💸',
      title: 'Auto-Save on Every Payment',
      description: 'Save a percentage of every UPI payment automatically',
    },
    {
      icon: '📈',
      title: 'Smart Investments',
      description: 'Invest your savings in mutual funds with one tap',
    },
    {
      icon: '🎯',
      title: 'Achieve Your Goals',
      description: 'Set savings goals and track your progress',
    },
    {
      icon: '🔒',
      title: 'Secure & Safe',
      description: 'Bank-grade security with biometric authentication',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>💰</Text>
          <Text style={styles.title}>SaveInvest</Text>
          <Text style={styles.subtitle}>
            Automate your savings and grow your wealth
          </Text>
        </View>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          mode="contained"
          onPress={handleGetStarted}
          style={styles.button}
        >
          Get Started
        </CustomButton>
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  logo: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight as any,
    color: '#4CAF50',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    padding: spacing.lg,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  featureIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: '#333',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    marginBottom: spacing.md,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});
