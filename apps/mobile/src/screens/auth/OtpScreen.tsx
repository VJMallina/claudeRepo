import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
} from 'react-native';
import { Text, Button, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { useAuthStore } from '@/store/authStore';
import authService from '@/services/auth.service';
import { spacing, typography } from '@/theme/theme';

type OtpScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Otp'>;
  route: RouteProp<AuthStackParamList, 'Otp'>;
};

export default function OtpScreen({ navigation, route }: OtpScreenProps) {
  const { mobile } = route.params;
  const { login } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<RNTextInput | null>>([]);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (i < 6) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);
      if (pastedOtp.length === 6) {
        inputRefs.current[5]?.focus();
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all digits entered
    if (index === 5 && value) {
      const otpString = newOtp.join('');
      if (otpString.length === 6) {
        handleVerifyOtp(otpString);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpString?: string) => {
    const otpCode = otpString || otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await login(mobile, otpCode);

      // Navigation will be handled automatically by AppNavigator
      // based on authentication state and onboarding status
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      setError('');

      await authService.resendOtp(mobile);

      setResendTimer(30);
      setCanResend(false);

      // Restart timer
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to resend OTP';
      setError(errorMessage);
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
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{'\n'}
          <Text style={styles.mobile}>+91 {mobile}</Text>
        </Text>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.changeNumber}
        >
          Change Number
        </Button>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <RNTextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                error && styles.otpInputError,
                digit && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={index === 0 ? 6 : 1}
              selectTextOnFocus
              editable={!isLoading}
            />
          ))}
        </View>

        {error && (
          <HelperText type="error" visible={!!error} style={styles.error}>
            {error}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={() => handleVerifyOtp()}
          loading={isLoading}
          disabled={isLoading || otp.join('').length !== 6}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Verify OTP
        </Button>

        <View style={styles.resendContainer}>
          {canResend ? (
            <Button
              mode="text"
              onPress={handleResendOtp}
              disabled={isLoading}
            >
              Resend OTP
            </Button>
          ) : (
            <Text style={styles.timerText}>
              Resend OTP in {resendTimer}s
            </Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  mobile: {
    ...typography.body1,
    fontWeight: '600',
    color: '#000000',
  },
  changeNumber: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  otpInputFilled: {
    borderColor: '#6200EE',
    backgroundColor: '#F3E5F5',
  },
  otpInputError: {
    borderColor: '#B00020',
  },
  error: {
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  resendContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  timerText: {
    ...typography.body2,
    color: '#666666',
  },
});
