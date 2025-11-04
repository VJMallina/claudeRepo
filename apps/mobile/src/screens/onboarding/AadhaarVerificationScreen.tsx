import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText, Chip, Checkbox } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import kycService from '@/services/kyc.service';
import { spacing, typography } from '@/theme/theme';

type AadhaarVerificationScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'AadhaarVerification'>;
};

export default function AadhaarVerificationScreen({ navigation }: AadhaarVerificationScreenProps) {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateAadhaar = (aadhaar: string): boolean => {
    return /^\d{12}$/.test(aadhaar);
  };

  const formatAadhaar = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 4) formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    if (cleaned.length > 8) formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)}`;
    return formatted;
  };

  const handleVerifyAadhaar = async () => {
    const cleanedAadhaar = aadhaarNumber.replace(/\s/g, '');

    if (!validateAadhaar(cleanedAadhaar)) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    if (!consent) {
      setError('Please provide consent to verify your Aadhaar');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await kycService.verifyAadhaar({
        aadhaarNumber: cleanedAadhaar,
        consent: true,
      });

      navigation.navigate('LivenessCheck', { aadhaarNumber: cleanedAadhaar });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Aadhaar verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.emoji}>📇</Text>
          <Text style={styles.title}>Aadhaar Verification</Text>
          <Text style={styles.subtitle}>Complete Level 2 KYC to start investing</Text>
          <View style={styles.benefitsContainer}>
            <Chip icon="check" style={styles.chip}>Investment Access</Chip>
            <Chip icon="check" style={styles.chip}>Withdrawals</Chip>
          </View>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Aadhaar Number *"
            value={aadhaarNumber}
            onChangeText={(text) => {
              setAadhaarNumber(formatAadhaar(text));
              setError('');
            }}
            mode="outlined"
            style={styles.input}
            error={!!error}
            disabled={isLoading}
            keyboardType="numeric"
            maxLength={14}
            placeholder="1234 5678 9012"
          />
          {error && <HelperText type="error" visible={!!error}>{error}</HelperText>}

          <View style={styles.consentContainer}>
            <Checkbox
              status={consent ? 'checked' : 'unchecked'}
              onPress={() => setConsent(!consent)}
              disabled={isLoading}
            />
            <Text style={styles.consentText}>
              I consent to verify my Aadhaar details with UIDAI and share the information for KYC purposes
            </Text>
          </View>

          <Text style={styles.note}>
            Your Aadhaar data is encrypted and securely stored. We comply with UIDAI regulations.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleVerifyAadhaar}
            loading={isLoading}
            disabled={isLoading || !aadhaarNumber || !consent}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Verify Aadhaar
          </Button>
        </View>

        <View style={styles.progress}>
          <Text style={styles.progressText}>Step 3 of 5</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '60%' }]} />
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
  subtitle: { ...typography.body1, color: '#666666', textAlign: 'center', marginBottom: spacing.md },
  benefitsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm },
  chip: { backgroundColor: '#E8F5E9' },
  form: { marginBottom: spacing.xl },
  input: { marginBottom: spacing.xs },
  consentContainer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  consentText: { ...typography.body2, flex: 1, marginLeft: spacing.sm },
  note: { ...typography.caption, color: '#666666', marginTop: spacing.md, textAlign: 'center' },
  actions: { marginBottom: spacing.xl },
  button: { marginBottom: spacing.md },
  buttonContent: { paddingVertical: spacing.sm },
  progress: { marginTop: 'auto' },
  progressText: { ...typography.caption, color: '#666666', textAlign: 'center', marginBottom: spacing.sm },
  progressBar: { height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6200EE' },
});
