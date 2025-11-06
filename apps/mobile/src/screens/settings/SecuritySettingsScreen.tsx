import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Switch, List, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SecurityService from '@/services/security.service';
import { spacing, typography } from '../../theme/theme';

type RootStackParamList = {
  SecuritySettings: undefined;
  ChangePin: undefined;
  Setup2FA: undefined;
  SessionManagement: undefined;
  SecurityAlerts: undefined;
};

type SecuritySettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'SecuritySettings'>;

export default function SecuritySettingsScreen({ navigation }: SecuritySettingsScreenProps) {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSecurityStatus();
  }, []);

  const loadSecurityStatus = async () => {
    try {
      // Check 2FA status
      const twoFAStatus = await SecurityService.get2FAStatus();
      setTwoFactorEnabled(twoFAStatus.enabled);

      // Check biometric availability
      const biometricStatus = await SecurityService.isBiometricAvailable();
      setBiometricAvailable(biometricStatus.available);
      setBiometricType(biometricStatus.biometricType);
    } catch (error) {
      console.error('Failed to load security status:', error);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    if (value) {
      const result = await SecurityService.authenticateWithBiometric('Enable biometric authentication');
      if (result.success) {
        Alert.alert('Success', 'Biometric authentication enabled');
      } else {
        Alert.alert('Failed', result.error || 'Biometric authentication failed');
      }
    }
  };

  const handleToggle2FA = async (value: boolean) => {
    if (value) {
      navigation.navigate('Setup2FA');
    } else {
      Alert.prompt(
        'Disable 2FA',
        'Enter your 2FA code to disable',
        async (code) => {
          try {
            setIsLoading(true);
            await SecurityService.disable2FA(code);
            setTwoFactorEnabled(false);
            Alert.alert('Success', '2FA disabled');
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to disable 2FA');
          } finally {
            setIsLoading(false);
          }
        }
      );
    }
  };

  const handleLogoutAllDevices = async () => {
    Alert.alert(
      'Logout All Devices',
      'Are you sure you want to logout from all other devices?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecurityService.terminateAllOtherSessions();
              Alert.alert('Success', 'All other sessions have been terminated');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to logout devices');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Security Settings</Text>
        <Text style={styles.subtitle}>Manage your account security</Text>
      </View>

      {/* PIN */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Login Security</Text>

          <List.Item
            title="Change PIN"
            description="Update your 6-digit PIN"
            left={props => <List.Icon {...props} icon="lock" color="#6200EE" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ChangePin')}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* Biometric */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Icon source="fingerprint" size={24} color="#6200EE" />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>Biometric Authentication</Text>
                <Text style={styles.switchDescription}>
                  Use fingerprint or face recognition to login
                </Text>
              </View>
            </View>
            <Switch value={biometricAvailable} onValueChange={handleToggleBiometric} disabled={!biometricAvailable || isLoading} />
          </View>
        </Card.Content>
      </Card>

      {/* Two-Factor */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.switchRow}>
            <View style={styles.switchLeft}>
              <Icon source="shield-check" size={24} color="#6200EE" />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchLabel}>Two-Factor Authentication</Text>
                <Text style={styles.switchDescription}>
                  Require OTP for sensitive operations
                </Text>
              </View>
            </View>
            <Switch value={twoFactorEnabled} onValueChange={handleToggle2FA} disabled={isLoading} />
          </View>
        </Card.Content>
      </Card>

      {/* Session Management */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Session Management</Text>

          <List.Item
            title="Active Sessions"
            description="Manage logged-in devices"
            left={props => <List.Icon {...props} icon="devices" color="#6200EE" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('SessionManagement')}
            style={styles.listItem}
          />

          <Button
            mode="outlined"
            icon="logout"
            onPress={handleLogoutAllDevices}
            disabled={isLoading}
            style={styles.logoutButton}
          >
            Logout All Devices
          </Button>
        </Card.Content>
      </Card>

      {/* Info */}
      <Card style={styles.infoCard}>
        <Card.Content style={styles.infoContent}>
          <Icon source="information" size={20} color="#1976D2" />
          <Text style={styles.infoText}>
            Your account security is our top priority. Enable biometric and two-factor authentication for maximum protection.
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
  card: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: '#212121',
  },
  listItem: {
    paddingHorizontal: 0,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  switchTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    marginTop: spacing.md,
    borderColor: '#F44336',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    color: '#1565C0',
  },
});
