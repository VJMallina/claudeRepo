import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, HelperText, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import kycService from '@/services/kyc.service';
import { useAuthStore } from '@/store/authStore';
import { spacing, typography } from '@/theme/theme';
import { format } from 'date-fns';

type PanVerificationScreenProps = {
  navigation: NativeStackNavigationProp<
    OnboardingStackParamList,
    'PanVerification'
  >;
};

export default function PanVerificationScreen({
  navigation,
}: PanVerificationScreenProps) {
  const { user } = useAuthStore();

  const [panNumber, setPanNumber] = useState('');
  const [nameOnPan, setNameOnPan] = useState(user?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    panNumber: '',
    nameOnPan: '',
    dateOfBirth: '',
  });

  const validatePan = (pan: string): boolean => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const validateDate = (date: string): boolean => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date)) return false;

    const [day, month, year] = date.split('/').map(Number);
    const dob = new Date(year, month - 1, day);

    return (
      dob.getDate() === day &&
      dob.getMonth() === month - 1 &&
      dob.getFullYear() === year &&
      dob < new Date()
    );
  };

  const formatDateInput = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.length >= 2) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }
    if (cleaned.length >= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    return formatted;
  };

  const handleVerifyPan = async () => {
    // Validate
    const newErrors = { panNumber: '', nameOnPan: '', dateOfBirth: '' };
    let hasError = false;

    if (!validatePan(panNumber)) {
      newErrors.panNumber = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
      hasError = true;
    }

    if (!nameOnPan.trim()) {
      newErrors.nameOnPan = 'Name is required';
      hasError = true;
    }

    if (!validateDate(dateOfBirth)) {
      newErrors.dateOfBirth = 'Please enter a valid date (DD/MM/YYYY)';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    try {
      setIsLoading(true);

      // Convert DD/MM/YYYY to YYYY-MM-DD
      const [day, month, year] = dateOfBirth.split('/');
      const formattedDate = `${year}-${month}-${day}`;

      await kycService.verifyPan({
        panNumber: panNumber.toUpperCase(),
        name: nameOnPan.trim(),
        dateOfBirth: formattedDate,
      });

      // Navigate to next step
      navigation.navigate('AadhaarVerification');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'PAN verification failed';
      setErrors({ ...errors, panNumber: errorMessage });
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
        <View style={styles.header}>
          <Text style={styles.emoji}>🆔</Text>
          <Text style={styles.title}>PAN Verification</Text>
          <Text style={styles.subtitle}>
            Complete Level 1 KYC to unlock unlimited payments
          </Text>

          <View style={styles.benefitsContainer}>
            <Chip icon="check" style={styles.chip}>
              Unlimited Payments
            </Chip>
          </View>
        </View>

        <View style={styles.form}>
          <TextInput
            label="PAN Number *"
            value={panNumber}
            onChangeText={(text) => {
              setPanNumber(text.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              setErrors({ ...errors, panNumber: '' });
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.panNumber}
            disabled={isLoading}
            maxLength={10}
            autoCapitalize="characters"
            placeholder="ABCDE1234F"
          />
          {errors.panNumber && (
            <HelperText type="error" visible={!!errors.panNumber}>
              {errors.panNumber}
            </HelperText>
          )}

          <TextInput
            label="Name on PAN *"
            value={nameOnPan}
            onChangeText={(text) => {
              setNameOnPan(text);
              setErrors({ ...errors, nameOnPan: '' });
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.nameOnPan}
            disabled={isLoading}
            autoCapitalize="words"
          />
          {errors.nameOnPan && (
            <HelperText type="error" visible={!!errors.nameOnPan}>
              {errors.nameOnPan}
            </HelperText>
          )}

          <TextInput
            label="Date of Birth *"
            value={dateOfBirth}
            onChangeText={(text) => {
              setDateOfBirth(formatDateInput(text));
              setErrors({ ...errors, dateOfBirth: '' });
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.dateOfBirth}
            disabled={isLoading}
            keyboardType="numeric"
            placeholder="DD/MM/YYYY"
            maxLength={10}
          />
          {errors.dateOfBirth && (
            <HelperText type="error" visible={!!errors.dateOfBirth}>
              {errors.dateOfBirth}
            </HelperText>
          )}

          <Text style={styles.note}>
            Your PAN details will be verified with NSDL records
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleVerifyPan}
            loading={isLoading}
            disabled={
              isLoading ||
              !panNumber ||
              !nameOnPan ||
              !dateOfBirth
            }
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Verify PAN
          </Button>
        </View>

        <View style={styles.progress}>
          <Text style={styles.progressText}>Step 2 of 5</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '40%' }]} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: '#E8F5E9',
  },
  form: {
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.xs,
  },
  note: {
    ...typography.caption,
    color: '#666666',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  actions: {
    marginBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  progress: {
    marginTop: 'auto',
  },
  progressText: {
    ...typography.caption,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200EE',
  },
});
