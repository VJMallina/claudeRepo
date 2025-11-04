import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ProgressBar, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { spacing, typography } from '@/theme/theme';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user, loadUser } = useAuthStore();
  const { kycLevel, permissions, fetchStatus } = useOnboardingStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadUser(), fetchStatus()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getKycLevelInfo = () => {
    switch (kycLevel) {
      case 0:
        return { label: 'Basic', color: '#FFA000', progress: 0.33 };
      case 1:
        return { label: 'Verified', color: '#2196F3', progress: 0.66 };
      case 2:
        return { label: 'Complete', color: '#4CAF50', progress: 1.0 };
      default:
        return { label: 'Unknown', color: '#9E9E9E', progress: 0 };
    }
  };

  const kycInfo = getKycLevelInfo();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Section */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
        <Text style={styles.subtitle}>Let's grow your wealth today</Text>
      </View>

      {/* KYC Status Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>KYC Status</Text>
            <Chip style={{ backgroundColor: kycInfo.color }} textStyle={{ color: '#FFFFFF' }}>
              Level {kycLevel} - {kycInfo.label}
            </Chip>
          </View>
          <ProgressBar progress={kycInfo.progress} color={kycInfo.color} style={styles.progressBar} />

          {kycLevel < 2 && (
            <Button mode="text" onPress={() => {}} style={styles.upgradeButton}>
              Upgrade KYC Level →
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <StatCard title="Total Saved" value="₹0" icon="💰" />
        <StatCard title="Total Invested" value="₹0" icon="📈" />
      </View>

      {/* Features Access */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardTitle}>Your Access</Text>
          <FeatureAccess
            enabled={permissions.canMakePayments}
            title="Payments"
            description={
              permissions.maxPaymentAmount
                ? `Up to ₹${permissions.maxPaymentAmount.toLocaleString('en-IN')}`
                : 'Unlimited'
            }
          />
          <FeatureAccess
            enabled={permissions.canInvest}
            title="Investments"
            description="Invest in mutual funds"
          />
          <FeatureAccess
            enabled={permissions.canWithdraw}
            title="Withdrawals"
            description="Withdraw to bank account"
          />
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsContainer}>
        <ActionButton
          icon="💳"
          title="Make Payment"
          disabled={!permissions.canMakePayments}
          onPress={() => navigation.navigate('QRScanner')}
        />
        <ActionButton
          icon="💰"
          title="View Savings"
          onPress={() => navigation.navigate('Savings')}
        />
        <ActionButton
          icon="📊"
          title="Invest"
          disabled={!permissions.canInvest}
          onPress={() => navigation.navigate('Investments')}
        />
        <ActionButton
          icon="🏦"
          title="Withdraw"
          disabled={!permissions.canWithdraw}
          onPress={() => {}}
        />
      </View>
    </ScrollView>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <Card style={styles.statCard}>
      <Card.Content>
        <Text style={styles.statIcon}>{icon}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </Card.Content>
    </Card>
  );
}

function FeatureAccess({ enabled, title, description }: { enabled: boolean; title: string; description: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={[styles.featureIcon, { color: enabled ? '#4CAF50' : '#9E9E9E' }]}>
        {enabled ? '✓' : '✗'}
      </Text>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  title,
  disabled,
  onPress,
}: {
  icon: string;
  title: string;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Card
      style={[styles.actionButton, disabled && styles.actionButtonDisabled]}
      onPress={!disabled ? onPress : undefined}
    >
      <Card.Content style={styles.actionContent}>
        <Text style={styles.actionIcon}>{icon}</Text>
        <Text style={[styles.actionTitle, disabled && styles.actionTitleDisabled]}>{title}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: spacing.md },
  header: { marginBottom: spacing.lg },
  greeting: { ...typography.h2, marginBottom: spacing.xs },
  subtitle: { ...typography.body1, color: '#666666' },
  card: { marginBottom: spacing.md, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  cardTitle: { ...typography.h3, marginBottom: spacing.md },
  progressBar: { height: 8, borderRadius: 4, marginBottom: spacing.md },
  upgradeButton: { alignSelf: 'flex-start' },
  statsContainer: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  statCard: { flex: 1, elevation: 2 },
  statIcon: { fontSize: 32, marginBottom: spacing.xs },
  statValue: { ...typography.h2, marginBottom: spacing.xs },
  statTitle: { ...typography.caption, color: '#666666' },
  featureItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  featureIcon: { fontSize: 24, marginRight: spacing.md },
  featureContent: { flex: 1 },
  featureTitle: { ...typography.body1, fontWeight: '600' },
  featureDescription: { ...typography.caption, color: '#666666' },
  sectionTitle: { ...typography.h3, marginBottom: spacing.md },
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  actionButton: { width: '48%', elevation: 2 },
  actionButtonDisabled: { opacity: 0.5 },
  actionContent: { alignItems: 'center', paddingVertical: spacing.sm },
  actionIcon: { fontSize: 32, marginBottom: spacing.xs },
  actionTitle: { ...typography.body2, fontWeight: '600', textAlign: 'center' },
  actionTitleDisabled: { color: '#9E9E9E' },
});
