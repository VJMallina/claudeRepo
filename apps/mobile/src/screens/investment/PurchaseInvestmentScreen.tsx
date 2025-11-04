import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  HelperText,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import investmentService from '@/services/investment.service';
import savingsService from '@/services/savings.service';
import { spacing, typography } from '@/theme/theme';

type PurchaseRouteParams = {
  PurchaseInvestment: {
    fundId: string;
    fundName: string;
  };
};

export default function PurchaseInvestmentScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<PurchaseRouteParams, 'PurchaseInvestment'>>();
  const { fundId, fundName } = route.params;

  const [amount, setAmount] = useState('');
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    loadSavingsBalance();
  }, []);

  const loadSavingsBalance = async () => {
    try {
      const wallet = await savingsService.getWallet();
      setSavingsBalance(wallet.balance);
    } catch (err) {
      console.error('Failed to load savings:', err);
    }
  };

  const handlePurchase = async () => {
    const investAmount = parseFloat(amount);

    if (!investAmount || investAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (investAmount > savingsBalance) {
      setError(`Insufficient balance. Available: ₹${savingsBalance.toFixed(2)}`);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const investment = await investmentService.purchaseInvestment({
        fundId,
        amount: investAmount,
      });

      navigation.navigate('PurchaseSuccess', {
        investment,
        amount: investAmount,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Fund Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Investing in</Text>
            <Text style={styles.fundName}>{fundName}</Text>
          </Card.Content>
        </Card>

        {/* Amount Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Investment Amount</Text>
            <TextInput
              label="Amount (₹)"
              value={amount}
              onChangeText={(text) => {
                setAmount(text.replace(/[^0-9.]/g, ''));
                setError('');
              }}
              mode="outlined"
              keyboardType="decimal-pad"
              style={styles.input}
              error={!!error}
              disabled={isLoading}
              left={<TextInput.Affix text="₹" />}
            />
            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}

            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Available Balance:</Text>
              <Text style={styles.balanceValue}>
                ₹{savingsBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Summary */}
        {amount && parseFloat(amount) > 0 && (
          <Card style={styles.summaryCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Investment Amount</Text>
                <Text style={styles.summaryValue}>
                  ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment Source</Text>
                <Text style={styles.summaryValue}>Savings Wallet</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Purchase Button */}
        <Button
          mode="contained"
          onPress={handlePurchase}
          loading={isLoading}
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Confirm Purchase
        </Button>

        <Text style={styles.disclaimer}>
          By proceeding, you agree to purchase units at the applicable NAV on the transaction date.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  label: {
    ...typography.caption,
    color: '#666666',
    marginBottom: spacing.xs,
  },
  fundName: {
    ...typography.h3,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  balanceLabel: {
    ...typography.body2,
    color: '#666666',
  },
  balanceValue: {
    ...typography.body1,
    fontWeight: '600',
    color: '#6200EE',
  },
  summaryCard: {
    marginBottom: spacing.md,
    elevation: 2,
    backgroundColor: '#F3E5F5',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body1,
    color: '#666666',
  },
  summaryValue: {
    ...typography.body1,
    fontWeight: '600',
  },
  button: {
    marginTop: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  disclaimer: {
    ...typography.caption,
    color: '#666666',
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});
