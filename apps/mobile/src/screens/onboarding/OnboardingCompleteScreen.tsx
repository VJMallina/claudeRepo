import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { useOnboardingStore } from '@/store/onboardingStore';
import { spacing, typography } from '@/theme/theme';

type OnboardingCompleteScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'OnboardingComplete'>;
};

export default function OnboardingCompleteScreen({ navigation }: OnboardingCompleteScreenProps) {
  const { fetchStatus } = useOnboardingStore();

  const handleGetStarted = async () => {
    await fetchStatus();
    // Navigation will be handled automatically by AppNavigator
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>You're All Set!</Text>
        <Text style={styles.subtitle}>
          Your KYC verification is complete. Start saving and investing today!
        </Text>

        <View style={styles.features}>
          <FeatureItem icon="✓" text="Make unlimited payments" color="#4CAF50" />
          <FeatureItem icon="✓" text="Automatic savings on every transaction" color="#4CAF50" />
          <FeatureItem icon="✓" text="Invest in curated mutual funds" color="#4CAF50" />
          <FeatureItem icon="✓" text="Withdraw anytime to your bank" color="#4CAF50" />
        </View>
      </View>

      <Button
        mode="contained"
        onPress={handleGetStarted}
        style={styles.button}
        contentStyle={styles.buttonContent}
      >
        Get Started
      </Button>
    </View>
  );
}

function FeatureItem({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={[styles.featureIcon, { color }]}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: spacing.lg },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 80, marginBottom: spacing.lg },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.md },
  subtitle: { ...typography.body1, color: '#666666', textAlign: 'center', marginBottom: spacing.xxl },
  features: { width: '100%', marginTop: spacing.xl },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  featureIcon: { fontSize: 24, marginRight: spacing.md },
  featureText: { ...typography.body1, flex: 1 },
  button: { marginBottom: spacing.lg },
  buttonContent: { paddingVertical: spacing.sm },
});
