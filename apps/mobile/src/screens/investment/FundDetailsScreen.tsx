import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import investmentService from '@/services/investment.service';
import { InvestmentFund } from '@/types/api.types';
import { spacing, typography } from '@/theme/theme';

type FundDetailsRouteParams = {
  FundDetails: {
    fundId: string;
  };
};

export default function FundDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<FundDetailsRouteParams, 'FundDetails'>>();
  const { fundId } = route.params;

  const [fund, setFund] = useState<InvestmentFund | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFund();
  }, [fundId]);

  const loadFund = async () => {
    try {
      setIsLoading(true);
      const data = await investmentService.getFundById(fundId);
      setFund(data);
    } catch (error) {
      console.error('Failed to load fund:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvestNow = () => {
    navigation.navigate('PurchaseInvestment', { fundId, fundName: fund?.name });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return '#4CAF50';
      case 'MODERATE':
        return '#FF9800';
      case 'HIGH':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  if (!fund) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Fund not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Fund Header */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.fundName}>{fund.name}</Text>
              <Text style={styles.category}>{fund.category}</Text>
            </View>
            <Chip
              style={{ backgroundColor: getRiskColor(fund.riskLevel) }}
              textStyle={{ color: '#FFFFFF' }}
            >
              {fund.riskLevel}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* NAV */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionLabel}>Current NAV</Text>
          <Text style={styles.navValue}>₹{fund.currentNav.toFixed(4)}</Text>
          <Text style={styles.navDate}>
            As of {new Date().toLocaleDateString('en-IN')}
          </Text>
        </Card.Content>
      </Card>

      {/* Returns */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Returns</Text>
          <View style={styles.returnsGrid}>
            <ReturnItem label="1 Year" value={fund.returns1Year} />
            {fund.returns3Year && (
              <ReturnItem label="3 Years" value={fund.returns3Year} />
            )}
            {fund.returns5Year && (
              <ReturnItem label="5 Years" value={fund.returns5Year} />
            )}
          </View>
          <Text style={styles.disclaimer}>
            Past performance is not indicative of future results
          </Text>
        </Card.Content>
      </Card>

      {/* Investment Details */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Investment Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Minimum Investment</Text>
            <Text style={styles.detailValue}>
              ₹{fund.minimumInvestment.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{fund.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Risk Level</Text>
            <Text style={[styles.detailValue, { color: getRiskColor(fund.riskLevel) }]}>
              {fund.riskLevel}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Description */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{fund.description}</Text>
        </Card.Content>
      </Card>

      {/* Invest Button */}
      <Button
        mode="contained"
        onPress={handleInvestNow}
        style={styles.investButton}
        contentStyle={styles.investButtonContent}
      >
        Invest Now
      </Button>
    </ScrollView>
  );
}

function ReturnItem({ label, value }: { label: string; value: number }) {
  const isPositive = value > 0;
  return (
    <View style={styles.returnItem}>
      <Text style={styles.returnLabel}>{label}</Text>
      <Text style={[styles.returnValue, { color: isPositive ? '#4CAF50' : '#F44336' }]}>
        {isPositive ? '+' : ''}
        {value.toFixed(2)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    ...typography.h3,
    color: '#666666',
  },
  card: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  fundName: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  category: {
    ...typography.body2,
    color: '#666666',
    textTransform: 'capitalize',
  },
  sectionLabel: {
    ...typography.caption,
    color: '#666666',
    marginBottom: spacing.xs,
  },
  navValue: {
    ...typography.h1,
    color: '#6200EE',
    marginBottom: spacing.xs,
  },
  navDate: {
    ...typography.caption,
    color: '#666666',
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  returnsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  returnItem: {
    alignItems: 'center',
  },
  returnLabel: {
    ...typography.caption,
    color: '#666666',
    marginBottom: spacing.xs,
  },
  returnValue: {
    ...typography.h3,
  },
  disclaimer: {
    ...typography.caption,
    color: '#666666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.body1,
    color: '#666666',
  },
  detailValue: {
    ...typography.body1,
    fontWeight: '600',
  },
  description: {
    ...typography.body1,
    lineHeight: 24,
    color: '#333333',
  },
  investButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  investButtonContent: {
    paddingVertical: spacing.sm,
  },
});
