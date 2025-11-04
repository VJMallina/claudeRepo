import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import apiService from '@/services/api.service';
import { spacing, typography } from '@/theme/theme';

type BankAccountScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'BankAccount'>;
};

export default function BankAccountScreen({ navigation }: BankAccountScreenProps) {
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ accountNumber: '', ifscCode: '', accountHolderName: '' });

  const validateIfsc = (ifsc: string): boolean => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);

  const handleAddBank = async () => {
    const newErrors = { accountNumber: '', ifscCode: '', accountHolderName: '' };
    let hasError = false;

    if (accountNumber.length < 9 || accountNumber.length > 18) {
      newErrors.accountNumber = 'Invalid account number';
      hasError = true;
    }

    if (accountNumber !== confirmAccountNumber) {
      newErrors.accountNumber = 'Account numbers do not match';
      hasError = true;
    }

    if (!validateIfsc(ifscCode)) {
      newErrors.ifscCode = 'Invalid IFSC code';
      hasError = true;
    }

    if (!accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    try {
      setIsLoading(true);
      await apiService.post('/bank-accounts', {
        accountNumber,
        ifscCode: ifscCode.toUpperCase(),
        accountHolderName: accountHolderName.trim(),
      });

      navigation.navigate('OnboardingComplete');
    } catch (err: any) {
      setErrors({ ...errors, accountNumber: err.response?.data?.message || 'Failed to add bank account' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>🏦</Text>
          <Text style={styles.title}>Add Bank Account</Text>
          <Text style={styles.subtitle}>Add your bank account for withdrawals</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Account Holder Name *"
            value={accountHolderName}
            onChangeText={(text) => {
              setAccountHolderName(text);
              setErrors({ ...errors, accountHolderName: '' });
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.accountHolderName}
            disabled={isLoading}
            autoCapitalize="words"
          />
          {errors.accountHolderName && <HelperText type="error">{errors.accountHolderName}</HelperText>}

          <TextInput
            label="Account Number *"
            value={accountNumber}
            onChangeText={(text) => {
              setAccountNumber(text.replace(/\D/g, ''));
              setErrors({ ...errors, accountNumber: '' });
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.accountNumber}
            disabled={isLoading}
            keyboardType="numeric"
            maxLength={18}
          />

          <TextInput
            label="Confirm Account Number *"
            value={confirmAccountNumber}
            onChangeText={(text) => {
              setConfirmAccountNumber(text.replace(/\D/g, ''));
              setErrors({ ...errors, accountNumber: '' });
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.accountNumber}
            disabled={isLoading}
            keyboardType="numeric"
            maxLength={18}
          />
          {errors.accountNumber && <HelperText type="error">{errors.accountNumber}</HelperText>}

          <TextInput
            label="IFSC Code *"
            value={ifscCode}
            onChangeText={(text) => {
              setIfscCode(text.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setErrors({ ...errors, ifscCode: '' });
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.ifscCode}
            disabled={isLoading}
            autoCapitalize="characters"
            maxLength={11}
            placeholder="SBIN0001234"
          />
          {errors.ifscCode && <HelperText type="error">{errors.ifscCode}</HelperText>}

          <Text style={styles.note}>Your bank account will be verified via penny drop (₹1 test deposit)</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleAddBank}
          loading={isLoading}
          disabled={isLoading || !accountNumber || !ifscCode || !accountHolderName}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Add Bank Account
        </Button>

        <View style={styles.progress}>
          <Text style={styles.progressText}>Step 5 of 5</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flexGrow: 1, padding: spacing.lg },
  header: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  title: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body1, color: '#666666', textAlign: 'center' },
  form: { marginBottom: spacing.xl },
  input: { marginBottom: spacing.xs },
  note: { ...typography.caption, color: '#666666', marginTop: spacing.md, textAlign: 'center' },
  button: { marginBottom: spacing.xl },
  buttonContent: { paddingVertical: spacing.sm },
  progress: { marginTop: 'auto' },
  progressText: { ...typography.caption, color: '#666666', textAlign: 'center', marginBottom: spacing.sm },
  progressBar: { height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6200EE' },
});
