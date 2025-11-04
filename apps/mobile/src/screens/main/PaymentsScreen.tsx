import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { spacing, typography } from '@/theme/theme';

export default function PaymentsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content style={styles.emptyState}>
          <Text style={styles.emoji}>💳</Text>
          <Text style={styles.title}>No Payments Yet</Text>
          <Text style={styles.subtitle}>
            Make your first UPI payment and automatically save a percentage
          </Text>
          <Button mode="contained" onPress={() => {}} style={styles.button}>
            Make a Payment
          </Button>
        </Card.Content>
      </Card>

      <Text style={styles.sectionTitle}>How it works</Text>
      <InfoCard
        number="1"
        title="Set Savings %"
        description="Choose 1-50% to save from each payment"
      />
      <InfoCard
        number="2"
        title="Make Payment"
        description="Pay via UPI as you normally would"
      />
      <InfoCard
        number="3"
        title="Auto-Save"
        description="We automatically set aside your savings percentage"
      />
    </ScrollView>
  );
}

function InfoCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <Card style={styles.infoCard}>
      <Card.Content style={styles.infoContent}>
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{number}</Text>
        </View>
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoDescription}>{description}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: spacing.md },
  card: { marginBottom: spacing.lg, elevation: 2 },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  title: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body1, color: '#666666', textAlign: 'center', marginBottom: spacing.lg },
  button: { marginTop: spacing.md },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  infoCard: { marginBottom: spacing.md, elevation: 1 },
  infoContent: { flexDirection: 'row', alignItems: 'center' },
  numberCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  numberText: { color: '#FFFFFF', fontWeight: '600', fontSize: 18 },
  infoText: { flex: 1 },
  infoTitle: { ...typography.body1, fontWeight: '600', marginBottom: spacing.xs },
  infoDescription: { ...typography.body2, color: '#666666' },
});
