import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Icon, Button, FAB } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';
import { SavingsWallet, SavingsTransaction } from '../../types/api.types';
import savingsService from '../../services/savings.service';
import { format, parseISO } from 'date-fns';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

type RootStackParamList = {
  SavingsWallet: undefined;
  SavingsConfiguration: undefined;
  Withdrawal: undefined;
  ManualDeposit: undefined;
  SavingsAnalytics: undefined;
};

type SavingsWalletScreenProps = NativeStackScreenProps<RootStackParamList, 'SavingsWallet'>;

const screenWidth = Dimensions.get('window').width;

export default function SavingsWalletScreen({ navigation }: SavingsWalletScreenProps) {
  const [wallet, setWallet] = useState<SavingsWallet | null>(null);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFab, setShowFab] = useState(true);
  const [fabOpen, setFabOpen] = useState(false);

  // Sample chart data (in production, this would come from analytics)
  const chartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [120, 150, 130, 180, 200, 220, wallet?.balance || 0],
      },
    ],
  };

  useEffect(() => {
    loadSavingsData();
  }, []);

  const loadSavingsData = async () => {
    try {
      setLoading(true);
      const [walletData, transactionsData] = await Promise.all([
        savingsService.getBalance(),
        savingsService.getTransactions(1, 10),
      ]);
      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to load savings data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadSavingsData();
  }, []);

  const renderTransaction = ({ item }: { item: SavingsTransaction }) => {
    const isCredit = item.type === 'CREDIT';

    return (
      <Card style={styles.transactionCard}>
        <Card.Content style={styles.transactionContent}>
          <View style={styles.transactionLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: isCredit ? '#E8F5E9' : '#FFEBEE' },
              ]}
            >
              <Icon
                source={isCredit ? 'arrow-down' : 'arrow-up'}
                size={24}
                color={isCredit ? '#4CAF50' : '#F44336'}
              />
            </View>

            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{item.description}</Text>
              <Text style={styles.transactionDate}>
                {format(parseISO(item.createdAt), 'MMM dd, yyyy · hh:mm a')}
              </Text>
            </View>
          </View>

          <View style={styles.transactionRight}>
            <Text style={[styles.transactionAmount, isCredit ? styles.creditAmount : styles.debitAmount]}>
              {isCredit ? '+' : '-'}₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.balanceAfter}>
              Balance: ₹{item.balanceAfter.toLocaleString('en-IN')}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon source="piggy-bank-outline" size={64} color="#999" />
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start making payments with auto-save enabled to see your savings grow
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('SavingsConfiguration')}
        style={styles.emptyButton}
      >
        Configure Auto-Save
      </Button>
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Total Savings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SavingsAnalytics')}>
              <Icon source="chart-line" size={20} color="#6200EE" />
            </TouchableOpacity>
          </View>

          <Text style={styles.balanceAmount}>
            ₹{wallet?.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </Text>

          <View style={styles.balanceStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Saved</Text>
              <Text style={styles.statValue}>
                ₹{wallet?.totalSaved.toLocaleString('en-IN') || '0'}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Transactions</Text>
              <Text style={styles.statValue}>{wallet?.transactionCount || 0}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Mini Chart */}
      {wallet && wallet.balance > 0 && (
        <Card style={styles.chartCard}>
          <Card.Content>
            <Text style={styles.chartTitle}>This Week</Text>
            <LineChart
              data={chartData}
              width={screenWidth - spacing.lg * 4}
              height={120}
              chartConfig={{
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
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#6200EE',
                },
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </Card.Content>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ManualDeposit')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
            <Icon source="plus" size={24} color="#2196F3" />
          </View>
          <Text style={styles.actionText}>Deposit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Withdrawal')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
            <Icon source="bank-transfer-out" size={24} color="#FF9800" />
          </View>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SavingsConfiguration')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
            <Icon source="cog" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.actionText}>Configure</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('SavingsAnalytics')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
            <Icon source="chart-box" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.actionText}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmpty : null}
        onScroll={({ nativeEvent }) => {
          const currentScrollPosition = nativeEvent.contentOffset.y;
          setShowFab(currentScrollPosition < 50 || nativeEvent.contentOffset.y < 0);
        }}
      />

      {/* FAB for Quick Actions */}
      <FAB.Group
        open={fabOpen}
        visible={showFab}
        icon={fabOpen ? 'close' : 'plus'}
        actions={[
          {
            icon: 'piggy-bank',
            label: 'Deposit',
            onPress: () => navigation.navigate('ManualDeposit'),
          },
          {
            icon: 'bank-transfer-out',
            label: 'Withdraw',
            onPress: () => navigation.navigate('Withdrawal'),
          },
          {
            icon: 'cog',
            label: 'Configure',
            onPress: () => navigation.navigate('SavingsConfiguration'),
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  balanceCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: '#FFF',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#212121',
    marginBottom: spacing.md,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  chartCard: {
    marginBottom: spacing.md,
    backgroundColor: '#FFF',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: spacing.sm,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: 12,
    color: '#212121',
    fontWeight: '500',
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    marginTop: spacing.md,
    color: '#212121',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  creditAmount: {
    color: '#4CAF50',
  },
  debitAmount: {
    color: '#F44336',
  },
  balanceAfter: {
    fontSize: 11,
    color: '#999',
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
    marginBottom: spacing.lg,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  fab: {
    paddingBottom: spacing.md,
  },
});
