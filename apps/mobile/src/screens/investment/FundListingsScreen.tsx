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
  Searchbar,
  Chip,
  Card,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import investmentService from '@/services/investment.service';
import { InvestmentFund } from '@/types/api.types';
import { spacing, typography } from '@/theme/theme';

export default function FundListingsScreen() {
  const navigation = useNavigation<any>();

  const [funds, setFunds] = useState<InvestmentFund[]>([]);
  const [filteredFunds, setFilteredFunds] = useState<InvestmentFund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);

  useEffect(() => {
    loadFunds();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, selectedRisk, funds]);

  const loadFunds = async () => {
    try {
      setIsLoading(true);
      const data = await investmentService.getFunds();
      setFunds(data);
      setFilteredFunds(data);
    } catch (error) {
      console.error('Failed to load funds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFunds();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...funds];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (fund) =>
          fund.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fund.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((fund) => fund.category === selectedCategory);
    }

    // Risk filter
    if (selectedRisk) {
      filtered = filtered.filter((fund) => fund.riskLevel === selectedRisk);
    }

    setFilteredFunds(filtered);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleRiskFilter = (risk: string) => {
    setSelectedRisk(selectedRisk === risk ? null : risk);
  };

  const handleFundPress = (fund: InvestmentFund) => {
    navigation.navigate('FundDetails', { fundId: fund.id });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Loading funds...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search funds..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <Text style={styles.filterLabel}>Category:</Text>
        <Chip
          selected={selectedCategory === 'EQUITY'}
          onPress={() => handleCategoryFilter('EQUITY')}
          style={styles.chip}
        >
          Equity
        </Chip>
        <Chip
          selected={selectedCategory === 'DEBT'}
          onPress={() => handleCategoryFilter('DEBT')}
          style={styles.chip}
        >
          Debt
        </Chip>
        <Chip
          selected={selectedCategory === 'HYBRID'}
          onPress={() => handleCategoryFilter('HYBRID')}
          style={styles.chip}
        >
          Hybrid
        </Chip>
        <Chip
          selected={selectedCategory === 'LIQUID'}
          onPress={() => handleCategoryFilter('LIQUID')}
          style={styles.chip}
        >
          Liquid
        </Chip>
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        <Text style={styles.filterLabel}>Risk:</Text>
        <Chip
          selected={selectedRisk === 'LOW'}
          onPress={() => handleRiskFilter('LOW')}
          style={styles.chip}
        >
          Low
        </Chip>
        <Chip
          selected={selectedRisk === 'MODERATE'}
          onPress={() => handleRiskFilter('MODERATE')}
          style={styles.chip}
        >
          Moderate
        </Chip>
        <Chip
          selected={selectedRisk === 'HIGH'}
          onPress={() => handleRiskFilter('HIGH')}
          style={styles.chip}
        >
          High
        </Chip>
      </ScrollView>

      {/* Funds List */}
      <FlatList
        data={filteredFunds}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FundCard fund={item} onPress={handleFundPress} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No funds found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
}

function FundCard({
  fund,
  onPress,
}: {
  fund: InvestmentFund;
  onPress: (fund: InvestmentFund) => void;
}) {
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

  return (
    <Card style={styles.fundCard} onPress={() => onPress(fund)}>
      <Card.Content>
        <View style={styles.fundHeader}>
          <View style={styles.fundTitleContainer}>
            <Text style={styles.fundName} numberOfLines={2}>
              {fund.name}
            </Text>
            <Text style={styles.fundCategory}>{fund.category}</Text>
          </View>
          <Chip
            style={{ backgroundColor: getRiskColor(fund.riskLevel) }}
            textStyle={{ color: '#FFFFFF', fontSize: 12 }}
          >
            {fund.riskLevel}
          </Chip>
        </View>

        <View style={styles.fundStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>NAV</Text>
            <Text style={styles.statValue}>₹{fund.currentNav.toFixed(2)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>1Y Returns</Text>
            <Text style={[styles.statValue, styles.returnValue]}>
              {fund.returns1Year > 0 ? '+' : ''}
              {fund.returns1Year.toFixed(2)}%
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Min. Investment</Text>
            <Text style={styles.statValue}>
              ₹{fund.minimumInvestment.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <Button mode="text" onPress={() => onPress(fund)} style={styles.detailsButton}>
          View Details →
        </Button>
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
  loadingText: {
    ...typography.body1,
    marginTop: spacing.md,
    color: '#666666',
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F5F5F5',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.sm,
  },
  filtersContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterLabel: {
    ...typography.body2,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  chip: {
    marginRight: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
  },
  fundCard: {
    marginBottom: spacing.md,
    elevation: 2,
  },
  fundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  fundTitleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  fundName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  fundCategory: {
    ...typography.caption,
    color: '#666666',
    textTransform: 'capitalize',
  },
  fundStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...typography.caption,
    color: '#666666',
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.body1,
    fontWeight: '600',
  },
  returnValue: {
    color: '#4CAF50',
  },
  detailsButton: {
    alignSelf: 'flex-start',
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body2,
    color: '#666666',
  },
});
