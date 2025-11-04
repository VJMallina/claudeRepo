import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Share } from 'react-native';
import { Text, Card, Icon, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';
import { Transaction, TransactionType, TransactionStatus } from '../../types/api.types';
import transactionService from '../../services/transaction.service';
import { format, parseISO } from 'date-fns';

type RootStackParamList = {
  TransactionDetail: { transactionId: string };
  TransactionReceipt: { transactionId: string };
};

type TransactionDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TransactionDetail'
>;

export default function TransactionDetailScreen({
  route,
  navigation,
}: TransactionDetailScreenProps) {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactionById(transactionId);
      setTransaction(data);
    } catch (error) {
      console.error('Failed to load transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      setDownloadingReceipt(true);
      const { url, fileName } = await transactionService.downloadReceipt(transactionId);
      // In a real app, this would trigger a download or open the PDF
      console.log('Receipt downloaded:', url, fileName);
      // Navigate to receipt screen
      navigation.navigate('TransactionReceipt', { transactionId });
    } catch (error) {
      console.error('Failed to download receipt:', error);
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const handleShareReceipt = async () => {
    try {
      const { data } = await transactionService.getReceiptData(transactionId);
      await Share.share({
        message: `Transaction Receipt\n\nTransaction ID: ${transaction?.id}\nAmount: ₹${transaction?.amount}\nDate: ${transaction?.createdAt}`,
        title: 'Transaction Receipt',
      });
    } catch (error) {
      console.error('Failed to share receipt:', error);
    }
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
      INVESTMENT_PURCHASE: 'Investment Purchase',
      INVESTMENT_REDEMPTION: 'Investment Redemption',
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading transaction...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Icon source="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>Transaction not found</Text>
      </View>
    );
  }

  const isDebit = transaction.type === 'PAYMENT' ||
                  transaction.type === 'SAVINGS_DEBIT' ||
                  transaction.type === 'INVESTMENT_PURCHASE';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Status Header */}
      <Card style={[styles.statusCard, { backgroundColor: `${getStatusColor(transaction.status)}10` }]}>
        <Card.Content style={styles.statusContent}>
          <View
            style={[
              styles.statusIconContainer,
              { backgroundColor: getStatusColor(transaction.status) },
            ]}
          >
            <Icon
              source={transaction.status === 'SUCCESS' ? 'check' : transaction.status === 'FAILED' ? 'close' : 'clock-outline'}
              size={32}
              color="#FFF"
            />
          </View>

          <Text style={styles.statusTitle}>
            {transaction.status === 'SUCCESS' ? 'Transaction Successful' :
             transaction.status === 'FAILED' ? 'Transaction Failed' :
             'Transaction Pending'}
          </Text>

          <Text style={[styles.amount, isDebit && styles.debitAmount]}>
            {isDebit ? '-' : '+'}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>

          <Text style={styles.date}>
            {format(parseISO(transaction.createdAt), 'MMMM dd, yyyy · hh:mm a')}
          </Text>
        </Card.Content>
      </Card>

      {/* Transaction Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Transaction Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{transaction.id.substring(0, 16)}...</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{formatTransactionType(transaction.type)}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={[styles.detailValue, styles.detailValueWrap]}>{transaction.description}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(transaction.status)}20` },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: getStatusColor(transaction.status) }]}>
                {transaction.status}
              </Text>
            </View>
          </View>

          {/* Type-specific details */}
          {transaction.merchantName && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Merchant</Text>
                <Text style={styles.detailValue}>{transaction.merchantName}</Text>
              </View>
            </>
          )}

          {transaction.upiTransactionId && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>UPI Transaction ID</Text>
                <Text style={styles.detailValue}>{transaction.upiTransactionId}</Text>
              </View>
            </>
          )}

          {transaction.fundName && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fund Name</Text>
                <Text style={[styles.detailValue, styles.detailValueWrap]}>{transaction.fundName}</Text>
              </View>
            </>
          )}

          {transaction.units && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Units</Text>
                <Text style={styles.detailValue}>{transaction.units.toFixed(4)}</Text>
              </View>
            </>
          )}

          {transaction.savingsAmount && transaction.savingsAmount > 0 && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Savings Amount</Text>
                <Text style={[styles.detailValue, styles.savingsText]}>
                  +₹{transaction.savingsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </>
          )}

          {transaction.balanceAfter !== undefined && (
            <>
              <Divider style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Balance After</Text>
                <Text style={styles.detailValue}>
                  ₹{transaction.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Actions */}
      {transaction.status === 'SUCCESS' && (
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            icon="download"
            onPress={handleDownloadReceipt}
            loading={downloadingReceipt}
            disabled={downloadingReceipt}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            Download Receipt
          </Button>

          <Button
            mode="outlined"
            icon="share-variant"
            onPress={handleShareReceipt}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
          >
            Share Receipt
          </Button>
        </View>
      )}

      {/* Help Card */}
      <Card style={styles.helpCard}>
        <Card.Content style={styles.helpContent}>
          <Icon source="help-circle" size={20} color="#1976D2" />
          <Text style={styles.helpText}>
            Need help with this transaction? Contact our support team.
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
  statusCard: {
    marginBottom: spacing.lg,
  },
  statusContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
    color: '#212121',
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: spacing.xs,
  },
  debitAmount: {
    color: '#F44336',
  },
  date: {
    ...typography.body1,
    color: '#666',
  },
  detailsCard: {
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
    ...typography.body1,
    color: '#666',
  },
  detailValue: {
    ...typography.body1,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'right',
  },
  detailValueWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  savingsText: {
    color: '#4CAF50',
  },
  divider: {
    marginVertical: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  actionButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
  helpCard: {
    backgroundColor: '#E3F2FD',
    marginBottom: spacing.lg,
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helpText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    color: '#1565C0',
  },
});
