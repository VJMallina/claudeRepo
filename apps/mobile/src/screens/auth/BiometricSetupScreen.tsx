import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import { CustomButton } from '@/components';
import { spacing, typography } from '@/theme/theme';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '@/store/authStore';

type BiometricSetupScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'BiometricSetup'>;
};

export default function BiometricSetupScreen({
  navigation,
}: BiometricSetupScreenProps) {
  const { setUser, user } = useAuthStore();
  const [isSupported, setIsSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      setIsSupported(compatible && enrolled);

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Fingerprint');
      } else {
        setBiometricType('Biometric');
      }
    } catch (error) {
      console.error('Error checking biometric support:', error);
      setIsSupported(false);
    }
  };

  const handleEnableBiometric = async () => {
    try {
      setIsLoading(true);
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${biometricType} login`,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Update user preference
        if (user) {
          setUser({ ...user, biometricEnabled: true });
        }
        navigation.replace('Onboarding' as any);
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.replace('Onboarding' as any);
  };

  if (!isSupported) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Biometric Not Available</Text>
          <Text style={styles.message}>
            Your device doesn't support biometric authentication or you haven't
            set it up yet. You can enable it later in settings.
          </Text>
        </View>
        <View style={styles.footer}>
          <CustomButton mode="contained" onPress={handleSkip}>
            Continue
          </CustomButton>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>
          {biometricType === 'Face ID' ? '👤' : '👆'}
        </Text>
        <Text style={styles.title}>Enable {biometricType}</Text>
        <Text style={styles.message}>
          Use {biometricType} for quick and secure access to your account
        </Text>

        <View style={styles.benefits}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitText}>Quick login</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🔒</Text>
            <Text style={styles.benefitText}>Extra security</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✅</Text>
            <Text style={styles.benefitText}>Easy authentication</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <CustomButton
          mode="contained"
          onPress={handleEnableBiometric}
          loading={isLoading}
          style={styles.button}
        >
          Enable {biometricType}
        </CustomButton>
        <CustomButton
          mode="outlined"
          onPress={handleSkip}
          disabled={isLoading}
          style={styles.button}
        >
          Skip for Now
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight as any,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.body.fontSize,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  benefits: {
    marginTop: spacing.xl,
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    marginBottom: spacing.md,
  },
});
