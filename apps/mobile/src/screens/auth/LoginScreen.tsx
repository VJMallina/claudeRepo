import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import authService from '@/services/auth.service';
import { spacing, typography } from '@/theme/theme';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateMobile = (value: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(value);
  };

  const handleSendOtp = async () => {
    setError('');

    if (!validateMobile(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsLoading(true);
      await authService.register({ mobile });

      // Navigate to OTP screen
      navigation.navigate('Otp', { mobile });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Failed to send OTP. Please try again.';
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo/Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>💰</Text>
          </View>
          <Text style={styles.title}>SaveInvest</Text>
          <Text style={styles.subtitle}>
            Automate your savings, build your wealth
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Get Started</Text>
          <Text style={styles.formSubtitle}>
            Enter your mobile number to continue
          </Text>

          <TextInput
            label="Mobile Number"
            value={mobile}
            onChangeText={(text) => {
              setMobile(text.replace(/[^0-9]/g, ''));
              setError('');
            }}
            keyboardType="phone-pad"
            maxLength={10}
            mode="outlined"
            left={<TextInput.Affix text="+91" />}
            style={styles.input}
            error={!!error}
            disabled={isLoading}
          />

          {error && (
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSendOtp}
            loading={isLoading}
            disabled={isLoading || mobile.length !== 10}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Send OTP
          </Button>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <FeatureItem
            icon="✓"
            text="Automatic savings from every payment"
          />
          <FeatureItem
            icon="✓"
            text="Invest in curated mutual funds"
          />
          <FeatureItem
            icon="✓"
            text="Track your wealth growth"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    ...typography.h1,
    color: '#6200EE',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: '#666666',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  formTitle: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    ...typography.body2,
    color: '#666666',
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  disclaimer: {
    ...typography.caption,
    color: '#666666',
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
  features: {
    marginTop: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    fontSize: 20,
    color: '#4CAF50',
    marginRight: spacing.sm,
  },
  featureText: {
    ...typography.body2,
    color: '#333333',
  },
});
