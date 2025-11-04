import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput, HelperText, RadioButton, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';
import { BankAccount } from '../../types/api.types';
import savingsService from '../../services/savings.service';
import bankAccountService from '../../services/bank-account.service';

type RootStackParamList = {
  Withdrawal: undefined;
  WithdrawalSuccess: { amount: number; bankAccount: BankAccount };
};

type WithdrawalScreenProps = NativeStackScreenProps<RootStackParamList, 'Withdrawal'>;

export default function WithdrawalScreen({ navigation }: WithdrawalScreenProps) {
  const [amount, setAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balance, accounts] = await Promise.all([
        savingsService.getBalance(),
        bankAccountService.getBankAccounts(),
      ]);
      setAvailableBalance(balance.balance);
      setBankAccounts(accounts);

      // Auto-select primary account
      const primaryAccount = accounts.find(acc => acc.isPrimary);
      if (primaryAccount) {
        setSelectedBankId(primaryAccount.id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setAmount(sanitized);
    if (error) setError(null);
  };

  const handleMaxAmount = () => {
    setAmount(availableBalance.toString());
  };

  const handleWithdraw = async () => {
    const withdrawalAmount = parseFloat(amount);

    // Validations
    if (!amount || isNaN(withdrawalAmount)) {
      setError('Please enter a valid amount');
      return;
    }

    if (withdrawalAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (withdrawalAmount > availableBalance) {
      setError('Insufficient balance');
      return;
    }

    if (!selectedBankId) {
      setError('Please select a bank account');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await savingsService.withdraw({
        amount: withdrawalAmount,
        bankAccountId: selectedBankId,
      });

      const selectedBank = bankAccounts.find(acc => acc.id === selectedBankId);
      navigation.navigate('WithdrawalSuccess', {
        amount: withdrawalAmount,
        bankAccount: selectedBank!,
      });
    } catch (error: any) {
      console.error('Failed to withdraw:', error);
      setError(error.response?.data?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBank = bankAccounts.find(acc => acc.id === selectedBankId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Withdraw Savings</Text>
        <Text style={styles.subtitle}>
          Transfer your savings to your bank account
        </Text>
      </View>

      {/* Available Balance */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ₹{availableBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>
        </Card.Content>
      </Card>

      {/* Amount Input */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Withdrawal Amount</Text>

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={handleAmountChange}
            mode="outlined"
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={!!error && error.includes('amount')}
            style={styles.input}
            left={<TextInput.Affix text="₹" />}
            right={
              <TextInput.Affix
                text="MAX"
                onPress={handleMaxAmount}
                textStyle={styles.maxButton}
              />
            }
          />
          {error && error.includes('amount') && (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          )}
          <HelperText type="info">
            Minimum withdrawal: ₹100
          </HelperText>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            {[500, 1000, 2000, 5000].map((quickAmount) => (
              <Button
                key={quickAmount}
                mode="outlined"
                onPress={() => setAmount(quickAmount.toString())}
                disabled={quickAmount > availableBalance}
                compact
                style={styles.quickButton}
              >
                ₹{quickAmount}
              </Button>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Bank Account Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Select Bank Account</Text>

          {bankAccounts.length === 0 ? (
            <View style={styles.noBanksContainer}>
              <Icon source="bank-off" size={48} color="#999" />
              <Text style={styles.noBanksText}>No bank accounts added</Text>
              <Button mode="contained" onPress={() => {/* Navigate to add bank */}}>
                Add Bank Account
              </Button>
            </View>
          ) : (
            <RadioButton.Group
              onValueChange={setSelectedBankId}
              value={selectedBankId || ''}
            >
              {bankAccounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  onPress={() => setSelectedBankId(account.id)}
                  style={[
                    styles.bankAccountCard,
                    selectedBankId === account.id && styles.bankAccountCardSelected,
                  ]}
                >
                  <View style={styles.bankAccountLeft}>
                    <Icon source="bank" size={32} color="#6200EE" />
                    <View style={styles.bankAccountInfo}>
                      <Text style={styles.bankName}>{account.bankName}</Text>
                      <Text style={styles.accountNumber}>
                        •••• {account.accountNumber.slice(-4)}
                      </Text>
                      <Text style={styles.accountHolder}>{account.accountHolderName}</Text>
                      {account.isPrimary && (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryText}>Primary</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <RadioButton value={account.id} />
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          )}

          {error && error.includes('bank') && (
            <HelperText type="error" visible>
              {error}
            </HelperText>
          )}
        </Card.Content>
      </Card>

      {/* Preview */}
      {amount && parseFloat(amount) > 0 && selectedBank && (
        <Card style={styles.previewCard}>
          <Card.Content>
            <Text style={styles.previewTitle}>Withdrawal Summary</Text>

            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Amount</Text>
              <Text style={styles.previewValue}>
                ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>To Account</Text>
              <Text style={styles.previewValue}>
                {selectedBank.bankName} •••• {selectedBank.accountNumber.slice(-4)}
              </Text>
            </View>

            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Processing Time</Text>
              <Text style={styles.previewValue}>1-2 business days</Text>
            </View>

            <View style={[styles.previewRow, styles.previewRowHighlight]}>
              <Text style={styles.previewLabelBold}>Remaining Balance</Text>
              <Text style={styles.previewValueBold}>
                ₹{(availableBalance - parseFloat(amount || '0')).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Info Note */}
      <Card style={styles.infoCard}>
        <Card.Content style={styles.infoContent}>
          <Icon source="information" size={20} color="#1976D2" />
          <Text style={styles.infoText}>
            Withdrawals typically take 1-2 business days to reflect in your bank account.
            No fees are charged for withdrawals.
          </Text>
        </Card.Content>
      </Card>

      {/* Error Message */}
      {error && !error.includes('amount') && !error.includes('bank') && (
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
        onPress={handleWithdraw}
        loading={submitting}
        disabled={submitting || loading || bankAccounts.length === 0}
        style={styles.submitButton}
        contentStyle={styles.buttonContent}
      >
        Withdraw Savings
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  balanceCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#6200EE',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
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
  maxButton: {
    color: '#6200EE',
    fontWeight: '600',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickButton: {
    flex: 1,
  },
  bankAccountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  bankAccountCardSelected: {
    borderColor: '#6200EE',
    backgroundColor: '#F3E5F5',
  },
  bankAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankAccountInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  accountNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  accountHolder: {
    fontSize: 13,
    color: '#999',
  },
  primaryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#6200EE',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  primaryText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  noBanksContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noBanksText: {
    ...typography.body1,
    color: '#666',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
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
  previewRowHighlight: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#90CAF9',
  },
  previewLabel: {
    fontSize: 14,
    color: '#1565C0',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
  },
  previewLabelBold: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D47A1',
  },
  previewValueBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D47A1',
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
