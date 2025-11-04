import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, SegmentedButtons, ActivityIndicator, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';
import { SavingsAnalytics } from '../../types/api.types';
import savingsService from '../../services/savings.service';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { format, parseISO, subMonths } from 'date-fns';

type RootStackParamList = {
  SavingsAnalytics: undefined;
};

type SavingsAnalyticsScreenProps = NativeStackScreenProps<RootStackParamList, 'SavingsAnalytics'>;

const screenWidth = Dimensions.get('window').width;

type Period = 'week' | 'month' | 'year';

export default function SavingsAnalyticsScreen({ navigation }: SavingsAnalyticsScreenProps) {
  const [analytics, setAnalytics] = useState<SavingsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await savingsService.getAnalytics(selectedPeriod);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.errorContainer}>
        <Icon source="chart-box-outline" size={64} color="#999" />
        <Text style={styles.errorText}>No analytics data available</Text>
      </View>
    );
  }

  // Prepare chart data
  const trendChartData = {
    labels: analytics.savingsTrend.map(item =>
      selectedPeriod === 'week' ? format(parseISO(item.date), 'EEE') :
      selectedPeriod === 'month' ? format(parseISO(item.date), 'dd MMM') :
      format(parseISO(item.date), 'MMM')
    ),
    datasets: [{
      data: analytics.savingsTrend.map(item => item.amount),
    }],
  };

  const merchantChartData = analytics.topMerchants.slice(0, 5).map((merchant, index) => ({
    name: merchant.merchantName.length > 15
      ? merchant.merchantName.substring(0, 12) + '...'
      : merchant.merchantName,
    amount: merchant.totalSaved,
    color: ['#6200EE', '#03DAC6', '#FF9800', '#4CAF50', '#9C27B0'][index],
    legendFontColor: '#212121',
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: '#6200EE',
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Savings Analytics</Text>
        <Text style={styles.subtitle}>Track your savings performance</Text>
      </View>

      {/* Period Selector */}
      <SegmentedButtons
        value={selectedPeriod}
        onValueChange={(value) => setSelectedPeriod(value as Period)}
        buttons={[
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
        style={styles.periodSelector}
      />

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Icon source="piggy-bank" size={24} color="#6200EE" />
            <Text style={styles.summaryValue}>
              ₹{analytics.totalSaved.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.summaryLabel}>Total Saved</Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Icon source="calendar-month" size={24} color="#03DAC6" />
            <Text style={styles.summaryValue}>
              ₹{analytics.savingsThisMonth.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.summaryLabel}>This Month</Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Icon source="calendar-week" size={24} color="#FF9800" />
            <Text style={styles.summaryValue}>
              ₹{analytics.savingsThisWeek.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.summaryLabel}>This Week</Text>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Icon source="chart-line" size={24} color="#4CAF50" />
            <Text style={styles.summaryValue}>
              {analytics.savingsGrowthPercentage > 0 ? '+' : ''}
              {analytics.savingsGrowthPercentage.toFixed(1)}%
            </Text>
            <Text style={styles.summaryLabel}>Growth</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Savings Trend Chart */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>Savings Trend</Text>
          <Text style={styles.chartSubtitle}>
            Daily savings over the selected period
          </Text>

          {analytics.savingsTrend.length > 0 ? (
            <LineChart
              data={trendChartData}
              width={screenWidth - spacing.lg * 4}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              withHorizontalLines={true}
              fromZero
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No data for this period</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Average Per Transaction */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Icon source="calculator" size={32} color="#9C27B0" />
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Average Per Transaction</Text>
                <Text style={styles.statValue}>
                  ₹{analytics.averageSavingsPerTransaction.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Top Merchants */}
      {analytics.topMerchants.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>Top Savings Sources</Text>
            <Text style={styles.chartSubtitle}>
              Merchants where you saved the most
            </Text>

            <PieChart
              data={merchantChartData}
              width={screenWidth - spacing.lg * 4}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="0"
              absolute
              style={styles.chart}
            />

            {/* Merchant List */}
            <View style={styles.merchantList}>
              {analytics.topMerchants.slice(0, 5).map((merchant, index) => (
                <View key={index} style={styles.merchantItem}>
                  <View style={styles.merchantLeft}>
                    <View
                      style={[
                        styles.merchantDot,
                        { backgroundColor: merchantChartData[index].color },
                      ]}
                    />
                    <Text style={styles.merchantName}>{merchant.merchantName}</Text>
                  </View>
                  <View style={styles.merchantRight}>
                    <Text style={styles.merchantAmount}>
                      ₹{merchant.totalSaved.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.merchantCount}>
                      {merchant.transactionCount} txns
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Insights */}
      <Card style={styles.insightsCard}>
        <Card.Content>
          <Text style={styles.insightsTitle}>Insights</Text>

          {analytics.savingsGrowthPercentage > 0 && (
            <View style={styles.insightItem}>
              <Icon source="trending-up" size={20} color="#4CAF50" />
              <Text style={styles.insightText}>
                Your savings have grown by {analytics.savingsGrowthPercentage.toFixed(1)}% compared to last period
              </Text>
            </View>
          )}

          {analytics.savingsThisMonth > analytics.totalSaved * 0.3 && (
            <View style={styles.insightItem}>
              <Icon source="fire" size={20} color="#FF9800" />
              <Text style={styles.insightText}>
                Great job! You've saved over 30% of your total savings this month
              </Text>
            </View>
          )}

          {analytics.averageSavingsPerTransaction > 50 && (
            <View style={styles.insightItem}>
              <Icon source="star" size={20} color="#FFD700" />
              <Text style={styles.insightText}>
                You're averaging ₹{analytics.averageSavingsPerTransaction.toFixed(0)} in savings per transaction
              </Text>
            </View>
          )}

          {analytics.savingsTrend.length >= 7 && (
            <View style={styles.insightItem}>
              <Icon source="calendar-check" size={20} color="#2196F3" />
              <Text style={styles.insightText}>
                You've been consistently saving for {analytics.savingsTrend.length} days. Keep it up!
              </Text>
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body1,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: spacing.xl,
  },
  errorText: {
    marginTop: spacing.lg,
    ...typography.h2,
    color: '#666',
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
  periodSelector: {
    marginBottom: spacing.lg,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    minWidth: (screenWidth - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: '#FFF',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  chartTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
    color: '#212121',
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.md,
    borderRadius: 16,
  },
  noDataContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
  },
  card: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statInfo: {
    marginLeft: spacing.md,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  merchantList: {
    marginTop: spacing.md,
  },
  merchantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  merchantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  merchantDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  merchantName: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },
  merchantRight: {
    alignItems: 'flex-end',
  },
  merchantAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  merchantCount: {
    fontSize: 12,
    color: '#999',
  },
  insightsCard: {
    backgroundColor: '#E8F5E9',
    marginBottom: spacing.lg,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  insightText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
});
