import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { spacing, typography } from '@/theme/theme';

type PaymentSuccessScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<
    {
      PaymentSuccess: {
        payment: any;
        savingsAmount: number;
      };
    },
    'PaymentSuccess'
  >;
};

export default function PaymentSuccessScreen({
  navigation,
  route,
}: PaymentSuccessScreenProps) {
  const { payment, savingsAmount } = route.params;

  const handleDone = () => {
    // Navigate back to main tabs
    navigation.navigate('Main', { screen: 'Home' });
  };

  const handleViewSavings = () => {
    navigation.navigate('Main', { screen: 'Savings' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>Your payment has been processed</Text>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Paid</Text>
              <Text style={styles.detailValue}>
                ₹{payment.amount?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Merchant</Text>
              <Text style={styles.detailValue}>{payment.merchantName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>
                {payment.upiTransactionId || payment.id}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.savingsCard}>
          <Card.Content style={styles.savingsContent}>
            <Text style={styles.savingsIcon}>🎉</Text>
            <Text style={styles.savingsTitle}>You Saved</Text>
            <Text style={styles.savingsAmount}>
              ₹{savingsAmount.toFixed(2)}
            </Text>
            <Text style={styles.savingsText}>
              Automatically added to your savings wallet!
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleDone}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Done
        </Button>
        <Button
          mode="outlined"
          onPress={handleViewSavings}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          View Savings
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    width: '100%',
    marginBottom: spacing.md,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.body2,
    color: '#666666',
  },
  detailValue: {
    ...typography.body1,
    fontWeight: '600',
  },
  savingsCard: {
    width: '100%',
    elevation: 2,
    backgroundColor: '#E8F5E9',
  },
  savingsContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  savingsIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  savingsTitle: {
    ...typography.body1,
    color: '#666666',
    marginBottom: spacing.xs,
  },
  savingsAmount: {
    ...typography.h1,
    color: '#4CAF50',
    marginBottom: spacing.sm,
  },
  savingsText: {
    ...typography.body2,
    color: '#666666',
    textAlign: 'center',
  },
  actions: {
    padding: spacing.lg,
  },
  button: {
    marginBottom: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
});
