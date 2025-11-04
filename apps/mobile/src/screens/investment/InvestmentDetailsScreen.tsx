import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Icon, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';
import { UserInvestment } from '../../types/api.types';
import investmentService from '../../services/investment.service';
import { format, parseISO } from 'date-fns';
import { LineChart } from 'react-native-chart-kit';

type RootStackParamList = {
  InvestmentDetails: { investmentId: string };
  Redemption: { investmentId: string };
};

type InvestmentDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'InvestmentDetails'
>;

const screenWidth = Dimensions.get('window').width;

export default function InvestmentDetailsScreen({
  route,
  navigation,
}: InvestmentDetailsScreenProps) {
  const { investmentId } = route.params;
  const [investment, setInvestment] = useState<UserInvestment | null>(null);
  const [navHistory, setNavHistory] = useState<Array<{ date: string; nav: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvestmentDetails();
  }, [investmentId]);

  const loadInvestmentDetails = async () => {
    try {
      setLoading(true);
      const [investmentData, historyData] = await Promise.all([
        investmentService.getInvestmentById(investmentId),
        investmentService.getNavHistory(investmentId),
      ]);
      setInvestment(investmentData);
      setNavHistory(historyData);
    } catch (error) {
      console.error('Failed to load investment details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading investment details...</Text>
      </View>
    );
  }

  if (!investment) {
    return (
      <View style={styles.errorContainer}>
        <Icon source="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>Investment not found</Text>
      </View>
    );
  }

  const returns = investment.currentValue - investment.investedAmount;
  const returnsPercentage = (returns / investment.investedAmount) * 100;
  const isPositive = returns >= 0;

  // Prepare NAV chart data
  const chartData = {
    labels: navHistory.map(item => format(parseISO(item.date), 'dd MMM')),
    datasets: [{
      data: navHistory.map(item => item.nav),
    }],
  };

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#6200EE',
    },
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Fund Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.categoryBadgeContainer}>
            <Chip mode="flat" style={styles.categoryChip}>
              {investment.fund.category}
            </Chip>
            <Chip
              mode="flat"
              style={[
                styles.riskChip,
                investment.fund.riskLevel === 'LOW' && styles.riskLow,
                investment.fund.riskLevel === 'MODERATE' && styles.riskModerate,
                investment.fund.riskLevel === 'HIGH' && styles.riskHigh,
              ]}
            >
              {investment.fund.riskLevel} RISK
            </Chip>
          </View>

          <Text style={styles.fundName}>{investment.fund.name}</Text>
        </Card.Content>
      </Card>

      {/* Investment Value */}
      <Card style={styles.valueCard}>
        <Card.Content>
          <Text style={styles.valueLabel}>Current Value</Text>
          <Text style={styles.currentValue}>
            ₹{investment.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>

          <View style={styles.returnsRow}>
            <View style={styles.returnItem}>
              <Text style={styles.returnLabel}>Total Returns</Text>
              <Text style={[styles.returnValue, isPositive ? styles.positive : styles.negative]}>
                {isPositive ? '+' : ''}₹{Math.abs(returns).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.returnDivider} />

            <View style={styles.returnItem}>
              <Text style={styles.returnLabel}>Returns %</Text>
              <Text style={[styles.returnValue, isPositive ? styles.positive : styles.negative]}>
                {isPositive ? '+' : ''}{returnsPercentage.toFixed(2)}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Investment Details */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Investment Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Units Held</Text>
            <Text style={styles.detailValue}>{investment.units.toFixed(4)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Invested Amount</Text>
            <Text style={styles.detailValue}>
              ₹{investment.investedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Purchase NAV</Text>
            <Text style={styles.detailValue}>
              ₹{investment.purchaseNav.toFixed(4)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current NAV</Text>
            <Text style={styles.detailValue}>
              ₹{investment.fund.currentNav.toFixed(4)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Purchase Date</Text>
            <Text style={styles.detailValue}>
              {format(parseISO(investment.purchaseDate), 'dd MMM yyyy')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                {investment.status}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* NAV History Chart */}
      {navHistory.length > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>NAV Performance (Last 30 Days)</Text>

            <LineChart
              data={chartData}
              width={screenWidth - spacing.lg * 4}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={true}
              withOuterLines={true}
              withVerticalLines={false}
              fromZero={false}
            />
          </Card.Content>
        </Card>
      )}

      {/* Fund Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Fund Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Minimum Investment</Text>
            <Text style={styles.detailValue}>
              ₹{investment.fund.minimumInvestment.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>1 Year Returns</Text>
            <Text style={[styles.detailValue, styles.positive]}>
              {investment.fund.returns1Year > 0 ? '+' : ''}
              {investment.fund.returns1Year.toFixed(2)}%
            </Text>
          </View>

          {investment.fund.returns3Year !== null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>3 Year Returns</Text>
              <Text style={[styles.detailValue, styles.positive]}>
                {investment.fund.returns3Year > 0 ? '+' : ''}
                {investment.fund.returns3Year.toFixed(2)}%
              </Text>
            </View>
          )}

          {investment.fund.returns5Year !== null && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>5 Year Returns</Text>
              <Text style={[styles.detailValue, styles.positive]}>
                {investment.fund.returns5Year > 0 ? '+' : ''}
                {investment.fund.returns5Year.toFixed(2)}%
              </Text>
            </View>
          )}

          <Text style={styles.description}>{investment.fund.description}</Text>
        </Card.Content>
      </Card>

      {/* Actions */}
      {investment.status === 'ACTIVE' && (
        <Button
          mode="contained"
          icon="cash"
          onPress={() => navigation.navigate('Redemption', { investmentId: investment.id })}
          style={styles.redeemButton}
          contentStyle={styles.buttonContent}
        >
          Redeem Investment
        </Button>
      )}

      {/* Info */}
      <Card style={styles.infoCard}>
        <Card.Content style={styles.infoContent}>
          <Icon source="information" size={20} color="#1976D2" />
          <Text style={styles.infoText}>
            Redemption proceeds will be credited to your bank account within 3-5 business days.
            Exit load may apply as per fund rules.
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
    color: '#F44336',
  },
  headerCard: {
    marginBottom: spacing.md,
    backgroundColor: '#FFF',
  },
  categoryBadgeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryChip: {
    backgroundColor: '#E3F2FD',
  },
  riskChip: {
    backgroundColor: '#E0E0E0',
  },
  riskLow: {
    backgroundColor: '#E8F5E9',
  },
  riskModerate: {
    backgroundColor: '#FFF3E0',
  },
  riskHigh: {
    backgroundColor: '#FFEBEE',
  },
  fundName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    lineHeight: 28,
  },
  valueCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#6200EE',
  },
  valueLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  currentValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: spacing.md,
  },
  returnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  returnItem: {
    flex: 1,
    alignItems: 'center',
  },
  returnDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  returnLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  returnValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  chart: {
    marginVertical: spacing.md,
    borderRadius: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: spacing.md,
  },
  redeemButton: {
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  buttonContent: {
    height: 48,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    marginBottom: spacing.lg,
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
