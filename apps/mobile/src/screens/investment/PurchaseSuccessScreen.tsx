import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { spacing, typography } from '@/theme/theme';

type SuccessRouteParams = {
  PurchaseSuccess: {
    investment: any;
    amount: number;
  };
};

export default function PurchaseSuccessScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<SuccessRouteParams, 'PurchaseSuccess'>>();
  const { investment, amount } = route.params;

  const handleViewPortfolio = () => {
    navigation.navigate('Portfolio');
  };

  const handleDone = () => {
    navigation.navigate('Main', { screen: 'Investments' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.successIcon}>🎉</Text>
        <Text style={styles.title}>Investment Successful!</Text>
        <Text style={styles.subtitle}>Your investment has been processed</Text>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Invested</Text>
              <Text style={styles.detailValue}>
                ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Units Allocated</Text>
              <Text style={styles.detailValue}>
                {investment.units?.toFixed(4) || 'Pending'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Purchase NAV</Text>
              <Text style={styles.detailValue}>
                ₹{investment.purchaseNav?.toFixed(4) || 'Pending'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoText}>
              💡 Units will be allocated at the closing NAV of the transaction date.
              You can view your investment in your portfolio.
            </Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          onPress={handleViewPortfolio}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          View Portfolio
        </Button>
        <Button
          mode="outlined"
          onPress={handleDone}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Done
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
  infoCard: {
    width: '100%',
    elevation: 2,
    backgroundColor: '#E3F2FD',
  },
  infoText: {
    ...typography.body2,
    color: '#1976D2',
    lineHeight: 20,
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
