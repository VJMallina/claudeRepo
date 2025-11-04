import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Button, TextInput, HelperText, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';
import savingsService from '../../services/savings.service';

type RootStackParamList = {
  ManualDeposit: undefined;
  DepositSuccess: { amount: number; transactionId: string };
};

type ManualDepositScreenProps = NativeStackScreenProps<RootStackParamList, 'ManualDeposit'>;

export default function ManualDepositScreen({ navigation }: ManualDepositScreenProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;

    setAmount(sanitized);
    if (error) setError(null);
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);

    // Validations
    if (!amount || isNaN(depositAmount)) {
      setError('Please enter a valid amount');
      return;
    }

    if (depositAmount < 100) {
      setError('Minimum deposit amount is ₹100');
      return;
    }

    if (depositAmount > 100000) {
      setError('Maximum deposit amount is ₹1,00,000');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // In real app, this would initiate UPI payment
      const result = await savingsService.deposit({
        amount: depositAmount,
        description: description.trim() || 'Manual deposit to savings',
      });

      navigation.navigate('DepositSuccess', {
        amount: depositAmount,
        transactionId: result.transactionId,
      });
    } catch (error: any) {
      console.error('Failed to deposit:', error);
      setError(error.response?.data?.message || 'Deposit failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add to Savings</Text>
          <Text style={styles.subtitle}>
            Deposit money directly to your savings wallet
          </Text>
        </View>

        {/* Amount Input */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Deposit Amount</Text>

            <TextInput
              label="Amount *"
              value={amount}
              onChangeText={handleAmountChange}
              mode="outlined"
              placeholder="0.00"
              keyboardType="decimal-pad"
              error={!!error && error.includes('amount')}
              style={styles.input}
              left={<TextInput.Affix text="₹" />}
            />
            {error && error.includes('amount') && (
              <HelperText type="error" visible>
                {error}
              </HelperText>
            )}
            <HelperText type="info">
              Min: ₹100 · Max: ₹1,00,000 per transaction
            </HelperText>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {[100, 500, 1000, 2000, 5000].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  mode="outlined"
                  onPress={() => setAmount(quickAmount.toString())}
                  compact
                  style={styles.quickButton}
                >
                  ₹{quickAmount}
                </Button>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Description (Optional) */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Description (Optional)</Text>

            <TextInput
              label="Add a note"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              placeholder="e.g., Monthly savings, Emergency fund"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            <HelperText type="info">
              This helps you track your deposits
            </HelperText>
          </Card.Content>
        </Card>

        {/* Payment Method Info */}
        <Card style={styles.paymentCard}>
          <Card.Content>
            <View style={styles.paymentHeader}>
              <Icon source="credit-card" size={24} color="#6200EE" />
              <Text style={styles.paymentTitle}>Payment Method</Text>
            </View>

            <View style={styles.paymentMethod}>
              <Icon source="cash-multiple" size={32} color="#4CAF50" />
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>UPI Payment</Text>
                <Text style={styles.paymentMethodSubtitle}>
                  Pay via any UPI app (GPay, PhonePe, Paytm, etc.)
                </Text>
              </View>
              <Icon source="chevron-right" size={24} color="#999" />
            </View>

            <Text style={styles.paymentNote}>
              You'll be redirected to your UPI app to complete the payment
            </Text>
          </Card.Content>
        </Card>

        {/* Benefits Card */}
        <Card style={styles.benefitsCard}>
          <Card.Content>
            <Text style={styles.benefitsTitle}>Why Add to Savings?</Text>

            <View style={styles.benefitItem}>
              <Icon source="piggy-bank" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Build your emergency fund</Text>
            </View>

            <View style={styles.benefitItem}>
              <Icon source="chart-line" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Invest in mutual funds anytime</Text>
            </View>

            <View style={styles.benefitItem}>
              <Icon source="shield-check" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Secure and instant transfers</Text>
            </View>

            <View style={styles.benefitItem}>
              <Icon source="cash-refund" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Withdraw to bank account anytime</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Preview */}
        {amount && parseFloat(amount) >= 100 && (
          <Card style={styles.previewCard}>
            <Card.Content>
              <Text style={styles.previewTitle}>Deposit Summary</Text>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Amount</Text>
                <Text style={styles.previewValue}>
                  ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Payment Method</Text>
                <Text style={styles.previewValue}>UPI</Text>
              </View>

              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Processing Fee</Text>
                <Text style={[styles.previewValue, styles.freeText]}>FREE</Text>
              </View>

              {description && (
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>Note</Text>
                  <Text style={[styles.previewValue, styles.previewValueWrap]}>
                    {description}
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Info Note */}
        <Card style={styles.infoCard}>
          <Card.Content style={styles.infoContent}>
            <Icon source="information" size={20} color="#1976D2" />
            <Text style={styles.infoText}>
              Your deposit will be instantly credited to your savings wallet once the payment is successful.
            </Text>
          </Card.Content>
        </Card>

        {/* Error Message */}
        {error && !error.includes('amount') && (
          <Card style={styles.errorCard}>
            <Card.Content style={styles.errorContent}>
              <Icon source="alert-circle" size={20} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleDeposit}
          loading={submitting}
          disabled={submitting || !amount || parseFloat(amount) < 100}
          style={styles.submitButton}
          contentStyle={styles.buttonContent}
        >
          Proceed to Pay
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
    color: '#212121',
  },
  subtitle: {
    ...typography.body1,
    color: '#666',
  },
  card: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: '#212121',
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: spacing.sm,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickButton: {
    flex: 0,
    minWidth: 80,
  },
  paymentCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#F3E5F5',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginLeft: spacing.sm,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  paymentMethodSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  paymentNote: {
    fontSize: 12,
    color: '#9C27B0',
    fontStyle: 'italic',
  },
  benefitsCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#E8F5E9',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: spacing.sm,
  },
  previewCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#E3F2FD',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: spacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  previewLabel: {
    fontSize: 14,
    color: '#1565C0',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    textAlign: 'right',
  },
  previewValueWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  freeText: {
    color: '#4CAF50',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    marginBottom: spacing.lg,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    color: '#1565C0',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    marginBottom: spacing.lg,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    color: '#C62828',
  },
  submitButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
});
