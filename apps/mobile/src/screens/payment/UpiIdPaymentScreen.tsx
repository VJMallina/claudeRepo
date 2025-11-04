import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText, Card, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';

type RootStackParamList = {
  UpiIdPayment: undefined;
  PaymentConfirmation: {
    merchantUpiId: string;
    merchantName: string;
    amount: number | null;
  };
  QRScanner: undefined;
};

type UpiIdPaymentScreenProps = NativeStackScreenProps<RootStackParamList, 'UpiIdPayment'>;

export default function UpiIdPaymentScreen({ navigation }: UpiIdPaymentScreenProps) {
  const [upiId, setUpiId] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<{ upiId?: string; merchantName?: string; amount?: string }>({});

  // Popular UPI handles for quick suggestions
  const popularHandles = ['@paytm', '@phonepe', '@googlepay', '@ybl', '@okaxis', '@oksbi'];
  const [recentUpiIds] = useState<string[]>([
    // This would come from local storage in a real app
  ]);

  const validateUpiId = (value: string): boolean => {
    // UPI ID format: username@bankhandle
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
    return upiRegex.test(value);
  };

  const validateAmount = (value: string): boolean => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue > 0;
  };

  const handleUpiIdChange = (value: string) => {
    setUpiId(value.toLowerCase().trim());
    if (errors.upiId) {
      setErrors({ ...errors, upiId: undefined });
    }
  };

  const handleMerchantNameChange = (value: string) => {
    setMerchantName(value);
    if (errors.merchantName) {
      setErrors({ ...errors, merchantName: undefined });
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and single decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;

    setAmount(sanitized);
    if (errors.amount) {
      setErrors({ ...errors, amount: undefined });
    }
  };

  const handleContinue = () => {
    const newErrors: { upiId?: string; merchantName?: string; amount?: string } = {};

    // Validate UPI ID
    if (!upiId) {
      newErrors.upiId = 'UPI ID is required';
    } else if (!validateUpiId(upiId)) {
      newErrors.upiId = 'Invalid UPI ID format (e.g., username@paytm)';
    }

    // Validate merchant name
    if (!merchantName.trim()) {
      newErrors.merchantName = 'Merchant name is required';
    }

    // Validate amount (optional)
    if (amount && !validateAmount(amount)) {
      newErrors.amount = 'Invalid amount';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Navigate to payment confirmation
    navigation.navigate('PaymentConfirmation', {
      merchantUpiId: upiId,
      merchantName: merchantName.trim(),
      amount: amount ? parseFloat(amount) : null,
    });
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner');
  };

  const handleAddHandle = (handle: string) => {
    if (upiId && !upiId.includes('@')) {
      setUpiId(upiId + handle);
    } else if (!upiId) {
      setUpiId(handle);
    }
  };

  const handleSelectRecent = (recentUpiId: string) => {
    setUpiId(recentUpiId);
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
          <Text style={styles.title}>Enter UPI Details</Text>
          <Text style={styles.subtitle}>
            Enter the merchant's UPI ID to make a payment
          </Text>
        </View>

        {/* QR Code Alternative */}
        <Card style={styles.qrCard} onPress={handleScanQR}>
          <Card.Content style={styles.qrCardContent}>
            <Text style={styles.qrCardText}>Or scan a QR code instead</Text>
            <Button mode="outlined" onPress={handleScanQR} compact>
              Scan QR
            </Button>
          </Card.Content>
        </Card>

        {/* Recent UPI IDs */}
        {recentUpiIds.length > 0 && (
          <View style={styles.recentContainer}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <View style={styles.chipsContainer}>
              {recentUpiIds.map((recentId) => (
                <Chip
                  key={recentId}
                  mode="outlined"
                  onPress={() => handleSelectRecent(recentId)}
                  style={styles.chip}
                >
                  {recentId}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {/* UPI ID Input */}
        <View style={styles.inputContainer}>
          <TextInput
            label="UPI ID *"
            value={upiId}
            onChangeText={handleUpiIdChange}
            mode="outlined"
            placeholder="username@paytm"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            error={!!errors.upiId}
            style={styles.input}
          />
          {errors.upiId && (
            <HelperText type="error" visible={!!errors.upiId}>
              {errors.upiId}
            </HelperText>
          )}
          {!errors.upiId && (
            <HelperText type="info">
              Example: 9876543210@paytm, username@phonepe
            </HelperText>
          )}

          {/* Popular UPI Handles */}
          <View style={styles.handlesContainer}>
            <Text style={styles.handlesLabel}>Quick add:</Text>
            <View style={styles.chipsContainer}>
              {popularHandles.map((handle) => (
                <Chip
                  key={handle}
                  mode="outlined"
                  onPress={() => handleAddHandle(handle)}
                  style={styles.chip}
                  compact
                >
                  {handle}
                </Chip>
              ))}
            </View>
          </View>
        </View>

        {/* Merchant Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            label="Merchant Name *"
            value={merchantName}
            onChangeText={handleMerchantNameChange}
            mode="outlined"
            placeholder="Enter merchant or receiver name"
            autoCapitalize="words"
            error={!!errors.merchantName}
            style={styles.input}
          />
          {errors.merchantName && (
            <HelperText type="error" visible={!!errors.merchantName}>
              {errors.merchantName}
            </HelperText>
          )}
        </View>

        {/* Amount Input (Optional) */}
        <View style={styles.inputContainer}>
          <TextInput
            label="Amount (Optional)"
            value={amount}
            onChangeText={handleAmountChange}
            mode="outlined"
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={!!errors.amount}
            style={styles.input}
            left={<TextInput.Affix text="₹" />}
          />
          {errors.amount && (
            <HelperText type="error" visible={!!errors.amount}>
              {errors.amount}
            </HelperText>
          )}
          {!errors.amount && (
            <HelperText type="info">
              Leave blank to enter amount on next screen
            </HelperText>
          )}
        </View>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoTitle}>Payment Flow</Text>
            <Text style={styles.infoText}>
              1. Enter UPI ID and merchant name{'\n'}
              2. Review payment details{'\n'}
              3. Complete payment via your UPI app{'\n'}
              4. Automatic savings based on your settings
            </Text>
          </Card.Content>
        </Card>

        {/* Continue Button */}
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
          contentStyle={styles.buttonContent}
        >
          Continue
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
  qrCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#E3F2FD',
  },
  qrCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrCardText: {
    ...typography.body1,
    color: '#1565C0',
  },
  recentContainer: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    color: '#212121',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    marginRight: 0,
    marginBottom: 0,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: '#FFF',
  },
  handlesContainer: {
    marginTop: spacing.sm,
  },
  handlesLabel: {
    ...typography.body2,
    color: '#666',
    marginBottom: spacing.xs,
  },
  infoCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  infoTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    color: '#212121',
  },
  infoText: {
    ...typography.body1,
    color: '#666',
    lineHeight: 24,
  },
  continueButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
});
