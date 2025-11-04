import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { spacing, typography } from '@/theme/theme';

export default function SavingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text style={styles.balanceLabel}>Savings Balance</Text>
          <Text style={styles.balanceAmount}>₹0.00</Text>
          <View style={styles.actions}>
            <Button mode="contained" onPress={() => {}} style={styles.actionButton}>
              Withdraw
            </Button>
            <Button mode="outlined" onPress={() => {}} style={styles.actionButton}>
              Invest
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content style={styles.emptyState}>
          <Text style={styles.emoji}>🐷</Text>
          <Text style={styles.title}>Start Saving Today</Text>
          <Text style={styles.subtitle}>
            Make your first payment to see your savings grow automatically
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: spacing.md },
  balanceCard: { marginBottom: spacing.md, elevation: 2, backgroundColor: '#6200EE' },
  balanceLabel: { ...typography.body1, color: '#FFFFFF', marginBottom: spacing.xs },
  balanceAmount: { ...typography.h1, color: '#FFFFFF', marginBottom: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md },
  actionButton: { flex: 1 },
  card: { elevation: 2 },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  title: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body1, color: '#666666', textAlign: 'center' },
});
