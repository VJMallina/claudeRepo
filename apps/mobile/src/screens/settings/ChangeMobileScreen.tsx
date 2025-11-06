import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, HelperText, Card } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileService from '@/services/profile.service';
import { spacing, typography } from '@/theme/theme';

type ChangeMobileScreenProps = NativeStackScreenProps<any, 'ChangeMobile'>;

export default function ChangeMobileScreen({ navigation }: ChangeMobileScreenProps) {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [newMobile, setNewMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateMobile = (mobile: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const handleRequestOTP = async () => {
    if (!validateMobile(newMobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      await ProfileService.requestMobileChange(newMobile);
      setStep('verify');
      Alert.alert('OTP Sent', `Verification code sent to ${newMobile}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const result = await ProfileService.changeMobile({
        newMobile,
        otp,
      });

      if (result.success) {
        Alert.alert(
          'Success',
          'Mobile number changed successfully. Please login again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Change Mobile Number</Text>
        <Text style={styles.subtitle}>
          {step === 'input'
            ? 'Enter your new mobile number to receive a verification code'
            : 'Enter the OTP sent to your new mobile number'}
        </Text>
      </View>

      {step === 'input' ? (
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="New Mobile Number"
              value={newMobile}
              onChangeText={(text) => {
                setNewMobile(text.replace(/\D/g, ''));
                setError('');
              }}
              mode="outlined"
              keyboardType="phone-pad"
              maxLength={10}
              error={!!error}
              style={styles.input}
              left={<TextInput.Affix text="+91" />}
            />
            {error ? (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            ) : (
              <HelperText type="info">
                Enter a 10-digit mobile number
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleRequestOTP}
              loading={isLoading}
              disabled={isLoading || newMobile.length !== 10}
              style={styles.button}
            >
              Send OTP
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.mobileText}>Sending OTP to: +91 {newMobile}</Text>

            <TextInput
              label="Enter OTP"
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/\D/g, ''));
                setError('');
              }}
              mode="outlined"
              keyboardType="number-pad"
              maxLength={6}
              error={!!error}
              style={styles.input}
            />
            {error && (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            )}

            <Button
              mode="contained"
              onPress={handleVerifyOTP}
              loading={isLoading}
              disabled={isLoading || otp.length !== 6}
              style={styles.button}
            >
              Verify & Change
            </Button>

            <Button
              mode="text"
              onPress={() => {
                setStep('input');
                setOtp('');
                setError('');
              }}
              disabled={isLoading}
              style={styles.button}
            >
              Change Number
            </Button>

            <Button
              mode="text"
              onPress={handleRequestOTP}
              disabled={isLoading}
              style={styles.button}
            >
              Resend OTP
            </Button>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>⚠️ Important</Text>
          <Text style={styles.infoText}>
            • You will be logged out after changing your mobile number{'\n'}
            • Use the new number to login next time{'\n'}
            • All your data and investments will be preserved
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: '#666',
  },
  card: {
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
  mobileText: {
    ...typography.body1,
    marginBottom: spacing.md,
    color: '#6200EE',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFF3E0',
  },
  infoTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body2,
    color: '#666',
    lineHeight: 20,
  },
});
