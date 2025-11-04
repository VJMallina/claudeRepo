import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import investmentService from '@/services/investment.service';
import { UserInvestment, InvestmentAnalytics } from '@/types/api.types';
import { spacing, typography } from '@/theme/theme';

export default function PortfolioScreen() {
  const navigation = useNavigation<any>();

  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [analytics, setAnalytics] = useState<InvestmentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      const [investmentsData, analyticsData] = await Promise.all([
        investmentService.getMyInvestments(),
        investmentService.getAnalytics(),
      ]);
      setInvestments(investmentsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPortfolio();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (investments.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyState}>
            <Text style={styles.emoji}>📊</Text>
            <Text style={styles.emptyTitle}>No Investments Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start investing in mutual funds to build your portfolio
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
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Portfolio Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryLabel}>Total Portfolio Value</Text>
            <Text style={styles.summaryValue}>
              ₹{analytics?.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Invested</Text>
                <Text style={styles.statValue}>
                  ₹{analytics?.totalInvested.toLocaleString('en-IN') || '0'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Returns</Text>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color: (analytics?.totalReturns || 0) >= 0 ? '#4CAF50' : '#F44336',
                    },
                  ]}
                >
                  {(analytics?.totalReturns || 0) >= 0 ? '+' : ''}₹
                  {analytics?.totalReturns.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Returns %</Text>
                <Text
                  style={[
                    styles.statValue,
                    {
                      color: (analytics?.returnsPercentage || 0) >= 0 ? '#4CAF50' : '#F44336',
                    },
                  ]}
                >
                  {(analytics?.returnsPercentage || 0) >= 0 ? '+' : ''}
                  {analytics?.returnsPercentage.toFixed(2) || '0.00'}%
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Holdings List */}
        <View style={styles.holdingsContainer}>
          <Text style={styles.holdingsTitle}>Your Holdings</Text>
          {investments.map((investment) => (
            <HoldingCard
              key={investment.id}
              investment={investment}
              onPress={() =>
                navigation.navigate('InvestmentDetails', { investmentId: investment.id })
              }
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function HoldingCard({
  investment,
  onPress,
}: {
  investment: UserInvestment;
  onPress: () => void;
}) {
  const returns = investment.currentValue - investment.investedAmount;
  const returnsPercentage = (returns / investment.investedAmount) * 100;

  return (
    <Card style={styles.holdingCard} onPress={onPress}>
      <Card.Content>
        <Text style={styles.fundName} numberOfLines={2}>
          {investment.fund.name}
        </Text>
        <Text style={styles.fundCategory}>{investment.fund.category}</Text>

        <View style={styles.holdingStats}>
          <View style={styles.holdingStatItem}>
            <Text style={styles.holdingStatLabel}>Invested</Text>
            <Text style={styles.holdingStatValue}>
              ₹{investment.investedAmount.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.holdingStatItem}>
            <Text style={styles.holdingStatLabel}>Current</Text>
            <Text style={styles.holdingStatValue}>
              ₹{investment.currentValue.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.holdingStatItem}>
            <Text style={styles.holdingStatLabel}>Returns</Text>
            <Text
              style={[
                styles.holdingStatValue,
                { color: returns >= 0 ? '#4CAF50' : '#F44336' },
              ]}
            >
              {returns >= 0 ? '+' : ''}₹{Math.abs(returns).toLocaleString('en-IN')}
              {'\n'}
              <Text style={styles.returnPercentage}>
                ({returns >= 0 ? '+' : ''}{returnsPercentage.toFixed(2)}%)
              </Text>
            </Text>
          </View>
        </View>

        <Text style={styles.unitsText}>
          {investment.units.toFixed(4)} units @ ₹{investment.purchaseNav.toFixed(2)}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  emptyContent: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  emptyCard: {
    elevation: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body1,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    marginTop: spacing.md,
  },
  summaryCard: {
    margin: spacing.md,
    elevation: 2,
    backgroundColor: '#6200EE',
  },
  summaryLabel: {
    ...typography.body1,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    ...typography.h1,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    ...typography.caption,
    color: '#E1BEE7',
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.body1,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  holdingsContainer: {
    padding: spacing.md,
  },
  holdingsTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  holdingCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  fundName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  fundCategory: {
    ...typography.caption,
    color: '#666666',
    marginBottom: spacing.md,
    textTransform: 'capitalize',
  },
  holdingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  holdingStatItem: {},
  holdingStatLabel: {
    ...typography.caption,
    color: '#666666',
    marginBottom: spacing.xs,
  },
  holdingStatValue: {
    ...typography.body1,
    fontWeight: '600',
  },
  returnPercentage: {
    ...typography.caption,
  },
  unitsText: {
    ...typography.caption,
    color: '#666666',
  },
});
