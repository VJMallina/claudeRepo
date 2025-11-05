import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { CustomButton, CustomTextInput } from '@/components';
import { spacing, typography } from '@/theme/theme';
import authService from '@/services/auth.service';

type ResetPinScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ResetPin'>;
};

export default function ResetPinScreen({ navigation }: ResetPinScreenProps) {
  const [step, setStep] = useState<'mobile' | 'otp' | 'newPin'>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setError('');

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsLoading(true);
      await authService.sendResetPinOtp({ mobile });
      setStep('otp');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      await authService.verifyResetPinOtp({ mobile, otp });
      setStep('newPin');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPin = async () => {
    setError('');

    if (newPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPin({ mobile, otp, newPin });
      navigation.navigate('Login');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to reset PIN. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMobileStep = () => (
    <>
      <View style={styles.content}>
        <Text style={styles.title}>Reset PIN</Text>
        <Text style={styles.subtitle}>
          Enter your registered mobile number to receive an OTP
        </Text>

        <View style={styles.form}>
          <CustomTextInput
            label="Mobile Number"
            value={mobile}
            onChangeText={setMobile}
            error={error}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="Enter 10-digit mobile number"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <CustomButton
          mode="contained"
          onPress={handleSendOtp}
          loading={isLoading}
          disabled={!mobile || isLoading}
        >
          Send OTP
        </CustomButton>
        <CustomButton
          mode="text"
          onPress={() => navigation.goBack()}
          disabled={isLoading}
          style={styles.backButton}
        >
          Back to Login
        </CustomButton>
      </View>
    </>
  );

  const renderOtpStep = () => (
    <>
      <View style={styles.content}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit OTP to {mobile}
        </Text>

        <View style={styles.form}>
          <CustomTextInput
            label="OTP"
            value={otp}
            onChangeText={setOtp}
            error={error}
            keyboardType="numeric"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
          />
        </View>

        <CustomButton
          mode="text"
          onPress={handleSendOtp}
          disabled={isLoading}
          style={styles.resendButton}
        >
          Resend OTP
        </CustomButton>
      </View>

      <View style={styles.footer}>
        <CustomButton
          mode="contained"
          onPress={handleVerifyOtp}
          loading={isLoading}
          disabled={!otp || isLoading}
        >
          Verify OTP
        </CustomButton>
      </View>
    </>
  );

  const renderNewPinStep = () => (
    <>
      <View style={styles.content}>
        <Text style={styles.title}>Create New PIN</Text>
        <Text style={styles.subtitle}>
          Enter a new 4-6 digit PIN to secure your account
        </Text>

        <View style={styles.form}>
          <CustomTextInput
            label="New PIN"
            value={newPin}
            onChangeText={setNewPin}
            error={error}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            placeholder="Enter new PIN"
          />

          <CustomTextInput
            label="Confirm PIN"
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            placeholder="Re-enter new PIN"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <CustomButton
          mode="contained"
          onPress={handleResetPin}
          loading={isLoading}
          disabled={!newPin || !confirmPin || isLoading}
        >
          Reset PIN
        </CustomButton>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {step === 'mobile' && renderMobileStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'newPin' && renderNewPinStep()}
      </ScrollView>
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
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  backButton: {
    marginTop: spacing.sm,
  },
  resendButton: {
    marginTop: spacing.md,
    alignSelf: 'center',
  },
});
