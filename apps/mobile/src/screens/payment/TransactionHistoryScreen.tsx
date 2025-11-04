import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Icon,
  Searchbar,
  Chip,
  Button,
  Portal,
  Modal,
  RadioButton,
  Divider,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';
import { Transaction, TransactionFilters, TransactionType, TransactionStatus } from '../../types/api.types';
import transactionService from '../../services/transaction.service';
import { format, parseISO } from 'date-fns';

type RootStackParamList = {
  TransactionHistory: undefined;
  TransactionDetail: { transactionId: string };
};

type TransactionHistoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TransactionHistory'
>;

export default function TransactionHistoryScreen({ navigation }: TransactionHistoryScreenProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'ALL',
    status: 'ALL',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<TransactionFilters>(filters);

  useEffect(() => {
    loadTransactions(1, true);
  }, [filters]);

  const loadTransactions = async (pageNum: number, reset: boolean = false) => {
    if (loading || loadingMore) return;

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await transactionService.getTransactions(pageNum, 20, {
        ...filters,
        search: searchQuery || undefined,
      });

      if (reset) {
        setTransactions(response.transactions);
      } else {
        setTransactions([...transactions, ...response.transactions]);
      }

      setHasMore(response.hasMore);
      setTotal(response.total);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadTransactions(1, true);
  }, [filters, searchQuery]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading && !loadingMore) {
      loadTransactions(page + 1, false);
    }
  }, [hasMore, loading, loadingMore, page]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      // Debounce would be better in production
      setTimeout(() => {
        loadTransactions(1, true);
      }, 500);
    },
    [filters]
  );

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    const resetFilters = { type: 'ALL' as const, status: 'ALL' as const };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setShowFilters(false);
  };

  const getTransactionIcon = (type: TransactionType): string => {
    switch (type) {
      case 'PAYMENT':
        return 'credit-card';
      case 'SAVINGS_CREDIT':
        return 'piggy-bank';
      case 'SAVINGS_DEBIT':
        return 'bank-transfer-out';
      case 'INVESTMENT_PURCHASE':
        return 'chart-line';
      case 'INVESTMENT_REDEMPTION':
        return 'cash';
      default:
        return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type: TransactionType): string => {
    switch (type) {
      case 'PAYMENT':
        return '#F44336';
      case 'SAVINGS_CREDIT':
        return '#4CAF50';
      case 'SAVINGS_DEBIT':
        return '#FF9800';
      case 'INVESTMENT_PURCHASE':
        return '#2196F3';
      case 'INVESTMENT_REDEMPTION':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case 'SUCCESS':
        return '#4CAF50';
      case 'FAILED':
        return '#F44336';
      case 'PENDING':
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const formatTransactionType = (type: TransactionType): string => {
    const typeMap: Record<TransactionType, string> = {
      PAYMENT: 'Payment',
      SAVINGS_CREDIT: 'Savings Added',
      SAVINGS_DEBIT: 'Savings Withdrawn',
      INVESTMENT_PURCHASE: 'Investment',
      INVESTMENT_REDEMPTION: 'Redemption',
    };
    return typeMap[type] || type;
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isDebit = item.type === 'PAYMENT' || item.type === 'SAVINGS_DEBIT' || item.type === 'INVESTMENT_PURCHASE';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}
      >
        <Card style={styles.transactionCard}>
          <Card.Content style={styles.transactionContent}>
            <View style={styles.transactionLeft}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${getTransactionColor(item.type)}20` },
                ]}
              >
                <Icon source={getTransactionIcon(item.type)} size={24} color={getTransactionColor(item.type)} />
              </View>

              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>{item.description}</Text>
                <View style={styles.transactionMeta}>
                  <Chip
                    mode="outlined"
                    compact
                    style={styles.typeChip}
                    textStyle={styles.typeChipText}
                  >
                    {formatTransactionType(item.type)}
                  </Chip>
                  <Text style={styles.transactionDate}>
                    {format(parseISO(item.createdAt), 'MMM dd, yyyy · hh:mm a')}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.transactionRight}>
              <Text style={[styles.transactionAmount, isDebit && styles.debitAmount]}>
                {isDebit ? '-' : '+'}₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(item.status)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon source="history" size={64} color="#999" />
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your transaction history will appear here once you start making payments or investments
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <Text>Loading more...</Text>
      </View>
    );
  };

  const activeFilterCount = [
    filters.type !== 'ALL' ? 1 : 0,
    filters.status !== 'ALL' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <Text style={styles.headerSubtitle}>
          {total} transaction{total !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Search */}
      <Searchbar
        placeholder="Search transactions"
        value={searchQuery}
        onChangeText={handleSearch}
        style={styles.searchBar}
      />

      {/* Filter Button */}
      <View style={styles.filterContainer}>
        <Button
          mode="outlined"
          icon="filter-variant"
          onPress={() => setShowFilters(true)}
          style={styles.filterButton}
        >
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </View>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!loading ? renderEmpty : null}
        ListFooterComponent={renderFooter}
      />

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Filter Transactions</Text>

          {/* Transaction Type Filter */}
          <Text style={styles.filterLabel}>Transaction Type</Text>
          <RadioButton.Group
            onValueChange={(value) =>
              setTempFilters({ ...tempFilters, type: value as TransactionType | 'ALL' })
            }
            value={tempFilters.type || 'ALL'}
          >
            <RadioButton.Item label="All Types" value="ALL" />
            <RadioButton.Item label="Payments" value="PAYMENT" />
            <RadioButton.Item label="Savings" value="SAVINGS_CREDIT" />
            <RadioButton.Item label="Withdrawals" value="SAVINGS_DEBIT" />
            <RadioButton.Item label="Investments" value="INVESTMENT_PURCHASE" />
            <RadioButton.Item label="Redemptions" value="INVESTMENT_REDEMPTION" />
          </RadioButton.Group>

          <Divider style={styles.divider} />

          {/* Status Filter */}
          <Text style={styles.filterLabel}>Status</Text>
          <RadioButton.Group
            onValueChange={(value) =>
              setTempFilters({ ...tempFilters, status: value as TransactionStatus | 'ALL' })
            }
            value={tempFilters.status || 'ALL'}
          >
            <RadioButton.Item label="All Statuses" value="ALL" />
            <RadioButton.Item label="Success" value="SUCCESS" />
            <RadioButton.Item label="Pending" value="PENDING" />
            <RadioButton.Item label="Failed" value="FAILED" />
          </RadioButton.Group>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={handleResetFilters} style={styles.modalButton}>
              Reset
            </Button>
            <Button mode="contained" onPress={handleApplyFilters} style={styles.modalButton}>
              Apply
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: spacing.lg,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    ...typography.h2,
    color: '#212121',
  },
  headerSubtitle: {
    ...typography.body2,
    color: '#666',
    marginTop: spacing.xs,
  },
  searchBar: {
    margin: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: '#FFF',
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  filterButton: {
    alignSelf: 'flex-start',
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  transactionCard: {
    marginBottom: spacing.md,
    backgroundColor: '#FFF',
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: spacing.xs,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  typeChip: {
    height: 24,
  },
  typeChipText: {
    fontSize: 11,
    marginVertical: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: spacing.xs,
  },
  debitAmount: {
    color: '#F44336',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    ...typography.h2,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: '#212121',
  },
  emptySubtitle: {
    ...typography.body1,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
    color: '#212121',
  },
  filterLabel: {
    ...typography.h3,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: '#212121',
  },
  divider: {
    marginVertical: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});
