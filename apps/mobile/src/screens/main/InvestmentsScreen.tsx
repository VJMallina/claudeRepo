import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { spacing, typography } from '@/theme/theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import investmentService from '@/services/investment.service';
import { UserInvestment } from '@/types/api.types';

export default function InvestmentsScreen() {
  const navigation = useNavigation<any>();
  const { permissions } = useOnboardingStore();

  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState(0);

  useEffect(() => {
    if (permissions.canInvest) {
      loadInvestments();
    } else {
      setIsLoading(false);
    }
  }, [permissions.canInvest]);

  const loadInvestments = async () => {
    try {
      setIsLoading(true);
      const data = await investmentService.getMyInvestments();
      setInvestments(data);
      const totalValue = data.reduce((sum, inv) => sum + inv.currentValue, 0);
      setPortfolioValue(totalValue);
    } catch (error) {
      console.error('Failed to load investments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInvestments();
    setRefreshing(false);
  };

  if (!permissions.canInvest) {
    return (
      <View style={styles.container}>
        <View style={styles.lockedContent}>
          <Text style={styles.emoji}>🔒</Text>
          <Text style={styles.title}>Complete KYC to Invest</Text>
          <Text style={styles.subtitle}>
            Complete Level 2 KYC verification to unlock investment features
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Portfolio Summary */}
      {investments.length > 0 && (
        <Card style={styles.portfolioCard}>
          <Card.Content>
            <Text style={styles.portfolioLabel}>Portfolio Value</Text>
            <Text style={styles.portfolioValue}>
              ₹{portfolioValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.portfolioHoldings}>
              {investments.length} {investments.length === 1 ? 'holding' : 'holdings'}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Portfolio')}
              style={styles.portfolioButton}
            >
              View Full Portfolio
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Card style={styles.actionCard} onPress={() => navigation.navigate('FundListings')}>
          <Card.Content style={styles.actionContent}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionTitle}>Browse Funds</Text>
            <Text style={styles.actionSubtitle}>Explore mutual funds</Text>
          </Card.Content>
        </Card>

        {investments.length > 0 && (
          <Card style={styles.actionCard} onPress={() => navigation.navigate('Portfolio')}>
            <Card.Content style={styles.actionContent}>
              <Text style={styles.actionIcon}>💼</Text>
              <Text style={styles.actionTitle}>My Portfolio</Text>
              <Text style={styles.actionSubtitle}>View holdings</Text>
            </Card.Content>
          </Card>
        )}
      </View>

      {/* Empty State */}
      {investments.length === 0 && (
        <Card style={styles.card}>
          <Card.Content style={styles.emptyState}>
            <Text style={styles.emoji}>📈</Text>
            <Text style={styles.title}>Start Investing</Text>
            <Text style={styles.subtitle}>
              Invest your savings in curated mutual funds and grow your wealth
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('FundListings')}
              style={styles.button}
            >
              Browse Funds
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  content: { padding: spacing.md },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  lockedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  portfolioCard: {
    marginBottom: spacing.md,
    elevation: 2,
    backgroundColor: '#6200EE',
  },
  portfolioLabel: {
    ...typography.body1,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  portfolioValue: {
    ...typography.h1,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  portfolioHoldings: {
    ...typography.caption,
    color: '#E1BEE7',
    marginBottom: spacing.md,
  },
  portfolioButton: {
    backgroundColor: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionCard: {
    flex: 1,
    elevation: 2,
  },
  actionContent: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  actionIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    ...typography.caption,
    color: '#666666',
  },
  card: { elevation: 2 },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  title: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: {
    ...typography.body1,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: { marginTop: spacing.md },
});
