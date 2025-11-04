import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, List, Button, Divider } from 'react-native-paper';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { spacing, typography } from '@/theme/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { kycLevel } = useOnboardingStore();

  const handleLogout = async () => {
    await logout();
  };

  const getKycLevelText = () => {
    switch (kycLevel) {
      case 0: return 'Basic (Level 0)';
      case 1: return 'Verified (Level 1)';
      case 2: return 'Complete (Level 2)';
      default: return 'Unknown';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.mobile}>+91 {user?.mobile}</Text>
          <Text style={styles.kycLevel}>KYC: {getKycLevelText()}</Text>
        </Card.Content>
      </Card>

      {/* Account Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Account</Text>
          <List.Item
            title="Personal Information"
            left={(props) => <List.Icon {...props} icon="account" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="KYC Documents"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Bank Accounts"
            left={(props) => <List.Icon {...props} icon="bank" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Settings</Text>
          <List.Item
            title="Notifications"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Security"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      {/* Support */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Support</Text>
          <List.Item
            title="Help & FAQ"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Contact Us"
            left={(props) => <List.Icon {...props} icon="email" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor="#B00020"
      >
        Logout
      </Button>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: spacing.md },
  headerCard: { marginBottom: spacing.md, elevation: 2 },
  header: { alignItems: 'center', paddingVertical: spacing.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: 32, color: '#FFFFFF', fontWeight: '600' },
  name: { ...typography.h2, marginBottom: spacing.xs },
  mobile: { ...typography.body1, color: '#666666', marginBottom: spacing.xs },
  kycLevel: { ...typography.caption, color: '#666666' },
  card: { marginBottom: spacing.md, elevation: 2 },
  sectionTitle: { ...typography.h3, marginBottom: spacing.sm },
  logoutButton: { marginTop: spacing.md, marginBottom: spacing.lg, borderColor: '#B00020' },
  version: { ...typography.caption, color: '#666666', textAlign: 'center', marginBottom: spacing.lg },
});
