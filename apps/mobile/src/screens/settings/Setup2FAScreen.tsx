import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, TextInput, Button, Card, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SecurityService from '@/services/security.service';
import { spacing, typography } from '@/theme/theme';

type Setup2FAScreenProps = NativeStackScreenProps<any, 'Setup2FA'>;

export default function Setup2FAScreen({ navigation }: Setup2FAScreenProps) {
  const [step, setStep] = useState<'init' | 'verify' | 'backup'>('init');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initialize2FA();
  }, []);

  const initialize2FA = async () => {
    try {
      setIsLoading(true);
      const config = await SecurityService.initialize2FA();
      setQrCode(config.qrCode || '');
      setSecret(config.secret || '');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to initialize 2FA');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const result = await SecurityService.enable2FA(verificationCode);

      if (result.success) {
        setBackupCodes(result.backupCodes);
        setStep('backup');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    Alert.alert(
      '2FA Enabled',
      'Two-Factor Authentication has been successfully enabled for your account.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {step === 'init' && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Setup 2FA</Text>
            <Text style={styles.subtitle}>
              Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
            </Text>
          </View>

          {qrCode ? (
            <Card style={styles.card}>
              <Card.Content style={styles.qrContainer}>
                <Image
                  source={{ uri: qrCode }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </Card.Content>
            </Card>
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.loadingText}>Loading QR Code...</Text>
              </Card.Content>
            </Card>
          )}

          {secret && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.label}>Manual Entry Code:</Text>
                <Text style={styles.secret} selectable>
                  {secret}
                </Text>
                <Text style={styles.helperText}>
                  Use this code if you can't scan the QR code
                </Text>
              </Card.Content>
            </Card>
          )}

          <Button
            mode="contained"
            onPress={() => setStep('verify')}
            disabled={!qrCode}
            style={styles.button}
          >
            Next
          </Button>
        </>
      )}

      {step === 'verify' && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Verify Setup</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code from your authenticator app to verify the setup
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Verification Code"
                value={verificationCode}
                onChangeText={(text) => {
                  setVerificationCode(text.replace(/\D/g, ''));
                  setError('');
                }}
                mode="outlined"
                keyboardType="number-pad"
                maxLength={6}
                error={!!error}
                style={styles.input}
              />
              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleVerify}
            loading={isLoading}
            disabled={isLoading || verificationCode.length !== 6}
            style={styles.button}
          >
            Verify & Enable
          </Button>

          <Button
            mode="text"
            onPress={() => setStep('init')}
            disabled={isLoading}
            style={styles.button}
          >
            Back
          </Button>
        </>
      )}

      {step === 'backup' && (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Backup Codes</Text>
            <Text style={styles.subtitle}>
              Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.warningText}>⚠️ Important</Text>
              <Text style={styles.helperText}>
                Each backup code can only be used once. Store them securely.
              </Text>

              <View style={styles.codesContainer}>
                {backupCodes.map((code, index) => (
                  <Chip key={index} style={styles.codeChip} textStyle={styles.codeText}>
                    {code}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={handleComplete}
            style={styles.button}
          >
            Done
          </Button>
        </>
      )}
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
  qrContainer: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  label: {
    ...typography.caption,
    color: '#666',
    marginBottom: spacing.xs,
  },
  secret: {
    ...typography.h3,
    color: '#6200EE',
    marginBottom: spacing.sm,
    fontFamily: 'monospace',
  },
  helperText: {
    ...typography.caption,
    color: '#666',
  },
  input: {
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: '#B00020',
    marginTop: spacing.xs,
  },
  loadingText: {
    ...typography.body1,
    textAlign: 'center',
    color: '#666',
  },
  warningText: {
    ...typography.h3,
    color: '#F57C00',
    marginBottom: spacing.sm,
  },
  codesContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  codeChip: {
    marginBottom: spacing.sm,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
});
