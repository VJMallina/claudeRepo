import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, Card, Slider } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import RazorpayService from '@/services/razorpay.service';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { spacing, typography } from '@/theme/theme';

type PaymentConfirmationScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<
    {
      PaymentConfirmation: {
        merchantUpiId: string;
        merchantName: string;
        amount: number | null;
      };
    },
    'PaymentConfirmation'
  >;
};

export default function PaymentConfirmationScreen({
  navigation,
  route,
}: PaymentConfirmationScreenProps) {
  const { merchantUpiId, merchantName, amount: scannedAmount } = route.params;
  const { user } = useAuthStore();
  const { permissions } = useOnboardingStore();

  const [amount, setAmount] = useState(scannedAmount?.toString() || '');
  const [savingsPercentage, setSavingsPercentage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateSavings = () => {
    const paymentAmount = parseFloat(amount) || 0;
    return (paymentAmount * savingsPercentage) / 100;
  };

  const handlePayment = async () => {
    const paymentAmount = parseFloat(amount);

    // Validation
    if (!paymentAmount || paymentAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (permissions.maxPaymentAmount && paymentAmount > permissions.maxPaymentAmount) {
      setError(
        `Payment limit exceeded. Maximum allowed: ₹${permissions.maxPaymentAmount.toLocaleString('en-IN')}`
      );
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Check payment limits
      const limitsCheck = await RazorpayService.checkPaymentLimits(paymentAmount * 100); // Convert to paise
      if (!limitsCheck.allowed) {
        setError(limitsCheck.message || 'Payment limit exceeded');
        setIsLoading(false);
        return;
      }

      // Process payment via Razorpay
      const result = await RazorpayService.processPayment({
        amount: paymentAmount,
        merchantName,
        merchantUpiId,
        description: `Payment to ${merchantName}`,
        userInfo: {
          name: user?.name,
          email: user?.email,
          contact: user?.mobile,
        },
      });

      if (result.verified && result.status === 'SUCCESS') {
        // Navigate to success screen
        navigation.navigate('PaymentSuccess', {
          payment: {
            id: result.paymentId,
            orderId: result.orderId,
            amount: paymentAmount,
            status: 'SUCCESS',
          },
          savingsAmount: calculateSavings(),
        });
      } else {
        setError(result.message || 'Payment verification failed');
      }
    } catch (err: any) {
      console.error('Payment error:', err);

      // Handle specific Razorpay errors
      if (err.code === 2) {
        Alert.alert('Payment Cancelled', 'You cancelled the payment');
      } else if (err.code === 0) {
        Alert.alert('Payment Failed', err.description || 'Payment failed. Please try again.');
      } else {
        const errorMessage =
          err.response?.data?.message || err.message || 'Payment failed. Please try again.';
        setError(errorMessage);
      }
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
        {/* Merchant Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Paying to</Text>
            <Text style={styles.merchantName}>{merchantName}</Text>
            <Text style={styles.upiId}>{merchantUpiId}</Text>
          </Card.Content>
        </Card>

        {/* Amount Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Payment Amount</Text>
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
              disabled={isLoading || !!scannedAmount}
              left={<TextInput.Affix text="₹" />}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}

            {permissions.maxPaymentAmount && (
              <Text style={styles.limitText}>
                Your payment limit: ₹{permissions.maxPaymentAmount.toLocaleString('en-IN')}
                {'\n'}
                <Text style={styles.upgradeText}>
                  Complete Level 1 KYC for unlimited payments
                </Text>
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Savings Percentage */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.savingsHeader}>
              <Text style={styles.label}>Auto-Save Percentage</Text>
              <Text style={styles.percentageValue}>{savingsPercentage}%</Text>
            </View>
            <Slider
              value={savingsPercentage}
              onValueChange={setSavingsPercentage}
              minimumValue={1}
              maximumValue={50}
              step={1}
              minimumTrackTintColor="#6200EE"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#6200EE"
              disabled={isLoading}
            />
            <Text style={styles.savingsInfo}>
              You'll save ₹{calculateSavings().toFixed(2)} from this payment
            </Text>
          </Card.Content>
        </Card>

        {/* Payment Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Amount</Text>
              <Text style={styles.summaryValue}>₹{amount || '0.00'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Auto-Savings ({savingsPercentage}%)</Text>
              <Text style={[styles.summaryValue, styles.savingsValue]}>
                +₹{calculateSavings().toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>You Pay</Text>
              <Text style={styles.totalValue}>₹{amount || '0.00'}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <Button
          mode="contained"
          onPress={handlePayment}
          loading={isLoading}
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Proceed to Pay ₹{amount || '0.00'}
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          disabled={isLoading}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
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
    textTransform: 'uppercase',
  },
  merchantName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  upiId: {
    ...typography.body2,
    color: '#666666',
  },
  input: {
    marginBottom: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: '#B00020',
    marginTop: spacing.xs,
  },
  limitText: {
    ...typography.caption,
    color: '#666666',
    marginTop: spacing.sm,
  },
  upgradeText: {
    color: '#6200EE',
    fontWeight: '600',
  },
  savingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  percentageValue: {
    ...typography.h2,
    color: '#6200EE',
  },
  savingsInfo: {
    ...typography.body2,
    color: '#4CAF50',
    marginTop: spacing.sm,
    textAlign: 'center',
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
  savingsValue: {
    color: '#4CAF50',
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalLabel: {
    ...typography.h3,
  },
  totalValue: {
    ...typography.h3,
    color: '#6200EE',
  },
  button: {
    marginTop: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  cancelButton: {
    marginTop: spacing.sm,
    alignSelf: 'center',
  },
});
