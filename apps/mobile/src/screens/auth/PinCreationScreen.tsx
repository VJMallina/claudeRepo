import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { CustomButton, CustomTextInput } from '@/components';
import { spacing, typography } from '@/theme/theme';
import authService from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';

type PinCreationScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'PinCreation'>;
};

export default function PinCreationScreen({ navigation }: PinCreationScreenProps) {
  const { setUser } = useAuthStore();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ pin: '', confirmPin: '' });

  const validatePin = (value: string): boolean => {
    if (value.length < 4) {
      setErrors(prev => ({ ...prev, pin: 'PIN must be at least 4 digits' }));
      return false;
    }
    if (value.length > 6) {
      setErrors(prev => ({ ...prev, pin: 'PIN must be at most 6 digits' }));
      return false;
    }
    if (!/^\d+$/.test(value)) {
      setErrors(prev => ({ ...prev, pin: 'PIN must contain only numbers' }));
      return false;
    }
    // Check for sequential numbers
    const isSequential = value.split('').every((digit, i, arr) => {
      if (i === 0) return true;
      return parseInt(digit) === parseInt(arr[i - 1]) + 1;
    });
    if (isSequential) {
      setErrors(prev => ({ ...prev, pin: 'PIN cannot be sequential numbers' }));
      return false;
    }
    // Check for repeated numbers
    const isRepeated = value.split('').every((digit, i, arr) => digit === arr[0]);
    if (isRepeated) {
      setErrors(prev => ({ ...prev, pin: 'PIN cannot be all the same digit' }));
      return false;
    }
    setErrors(prev => ({ ...prev, pin: '' }));
    return true;
  };

  const handleCreatePin = async () => {
    setErrors({ pin: '', confirmPin: '' });

    if (!validatePin(pin)) {
      return;
    }

    if (pin !== confirmPin) {
      setErrors(prev => ({ ...prev, confirmPin: 'PINs do not match' }));
      return;
    }

    try {
      setIsLoading(true);
      // Call API to set PIN
      const response = await authService.setPin({ pin });
      setUser(response.user);

      // Navigate to biometric setup (optional)
      navigation.navigate('BiometricSetup');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to create PIN. Please try again.';
      setErrors(prev => ({ ...prev, pin: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Create Your PIN</Text>
        <Text style={styles.subtitle}>
          Create a secure 4-6 digit PIN to protect your account
        </Text>

        <View style={styles.form}>
          <CustomTextInput
            label="Enter PIN"
            value={pin}
            onChangeText={(text) => {
              setPin(text);
              if (text.length >= 4) validatePin(text);
            }}
            error={errors.pin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            placeholder="Enter 4-6 digit PIN"
          />

          <CustomTextInput
            label="Confirm PIN"
            value={confirmPin}
            onChangeText={setConfirmPin}
            error={errors.confirmPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            placeholder="Re-enter your PIN"
          />

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>PIN Security Tips:</Text>
            <Text style={styles.tipItem}>• Use 4-6 digits</Text>
            <Text style={styles.tipItem}>• Avoid sequential numbers (1234)</Text>
            <Text style={styles.tipItem}>• Avoid repeated numbers (1111)</Text>
            <Text style={styles.tipItem}>• Don't use your birthdate</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <CustomButton
          mode="contained"
          onPress={handleCreatePin}
          loading={isLoading}
          disabled={!pin || !confirmPin || isLoading}
        >
          Create PIN
        </CustomButton>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight as any,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: '#666',
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginTop: spacing.xl,
  },
  tips: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
