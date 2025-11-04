import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { spacing, typography } from '@/theme/theme';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function InvestmentsScreen() {
  const { permissions } = useOnboardingStore();

  if (!permissions.canInvest) {
    return (
      <View style={styles.container}>
        <View style={styles.lockedContent}>
          <Text style={styles.emoji}>🔒</Text>
          <Text style={styles.title}>Complete KYC to Invest</Text>
          <Text style={styles.subtitle}>
            Complete Level 2 KYC verification to unlock investment features
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content style={styles.emptyState}>
          <Text style={styles.emoji}>📈</Text>
          <Text style={styles.title}>Start Investing</Text>
          <Text style={styles.subtitle}>
            Invest your savings in curated mutual funds and grow your wealth
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: spacing.md },
  lockedContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  card: { elevation: 2 },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  title: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body1, color: '#666666', textAlign: 'center' },
});
