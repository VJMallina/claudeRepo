import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Share } from 'react-native';
import { Text, Button, Divider, ActivityIndicator, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';
import { Transaction } from '../../types/api.types';
import transactionService from '../../services/transaction.service';
import { format, parseISO } from 'date-fns';

type RootStackParamList = {
  TransactionReceipt: { transactionId: string };
};

type TransactionReceiptScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TransactionReceipt'
>;

export default function TransactionReceiptScreen({
  route,
}: TransactionReceiptScreenProps) {
  const { transactionId } = route.params;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

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

  const handleShare = async () => {
    if (!transaction) return;

    try {
      setSharing(true);
      await Share.share({
        message: generateReceiptText(transaction),
        title: 'Transaction Receipt',
      });
    } catch (error) {
      console.error('Failed to share receipt:', error);
    } finally {
      setSharing(false);
    }
  };

  const generateReceiptText = (txn: Transaction): string => {
    return `
SaveInvest - Transaction Receipt

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Transaction ID: ${txn.id}
Date: ${format(parseISO(txn.createdAt), 'MMM dd, yyyy · hh:mm a')}

${txn.merchantName ? `Merchant: ${txn.merchantName}\n` : ''}Amount: ₹${txn.amount.toLocaleString('en-IN')}
${txn.savingsAmount && txn.savingsAmount > 0 ? `Savings: ₹${txn.savingsAmount.toLocaleString('en-IN')}\n` : ''}Status: ${txn.status}

${txn.upiTransactionId ? `UPI Txn ID: ${txn.upiTransactionId}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for using SaveInvest!
For support, visit: support@saveinvest.com
    `;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading receipt...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Icon source="alert-circle" size={64} color="#F44336" />
        <Text style={styles.errorText}>Receipt not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Receipt Container */}
        <View style={styles.receipt}>
          {/* Header */}
          <View style={styles.header}>
            <Icon source="check-circle" size={48} color="#4CAF50" />
            <Text style={styles.companyName}>SaveInvest</Text>
            <Text style={styles.receiptTitle}>TRANSACTION RECEIPT</Text>
          </View>

          <Divider style={styles.divider} />

          {/* Success Message */}
          <View style={styles.successSection}>
            <Text style={styles.successText}>Payment Successful</Text>
            <Text style={styles.successAmount}>
              ₹{transaction.amount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Transaction Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction ID</Text>
              <Text style={styles.detailValue}>{transaction.id.substring(0, 20)}...</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {format(parseISO(transaction.createdAt), 'MMM dd, yyyy')}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}></Text>
              <Text style={styles.detailValue}>
                {format(parseISO(transaction.createdAt), 'hh:mm a')}
              </Text>
            </View>

            <View style={styles.spacer} />

            {transaction.merchantName && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Paid To</Text>
                  <Text style={styles.detailValue}>{transaction.merchantName}</Text>
                </View>
              </>
            )}

            {transaction.description && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={[styles.detailValue, styles.detailValueWrap]}>
                  {transaction.description}
                </Text>
              </View>
            )}

            <View style={styles.spacer} />

            {transaction.upiTransactionId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>UPI Transaction ID</Text>
                <Text style={styles.detailValue}>{transaction.upiTransactionId}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, styles.statusSuccess]}>
                {transaction.status}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Amount Breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>Amount Breakdown</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Amount</Text>
              <Text style={styles.detailValue}>
                ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {transaction.savingsAmount && transaction.savingsAmount > 0 && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, styles.savingsLabel]}>Auto-Savings</Text>
                <Text style={[styles.detailValue, styles.savingsValue]}>
                  +₹{transaction.savingsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}

            {transaction.balanceAfter !== undefined && (
              <>
                <View style={styles.spacer} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Balance After</Text>
                  <Text style={styles.detailValue}>
                    ₹{transaction.balanceAfter.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Thank you for using SaveInvest</Text>
            <Text style={styles.footerSubtext}>
              For support, contact us at support@saveinvest.com
            </Text>
            <Text style={styles.footerSubtext}>
              This is a computer-generated receipt and does not require a signature
            </Text>
          </View>

          {/* Watermark */}
          <View style={styles.watermark}>
            <Icon source="check-decagram" size={100} color="rgba(76, 175, 80, 0.05)" />
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Button
          mode="contained"
          icon="share-variant"
          onPress={handleShare}
          loading={sharing}
          disabled={sharing}
          style={styles.actionButton}
          contentStyle={styles.buttonContent}
        >
          Share Receipt
        </Button>

        <Button
          mode="outlined"
          icon="download"
          onPress={() => {
            // In real app, this would download PDF
            console.log('Download PDF');
          }}
          style={styles.actionButton}
          contentStyle={styles.buttonContent}
        >
          Download PDF
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0E0E0',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
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
  receipt: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  companyName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6200EE',
    marginTop: spacing.md,
  },
  receiptTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: spacing.xs,
    letterSpacing: 2,
  },
  divider: {
    marginVertical: spacing.lg,
    backgroundColor: '#E0E0E0',
  },
  successSection: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: spacing.xs,
  },
  successAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#212121',
  },
  detailsSection: {
    marginVertical: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    textAlign: 'right',
  },
  detailValueWrap: {
    flexWrap: 'wrap',
  },
  statusSuccess: {
    color: '#4CAF50',
  },
  spacer: {
    height: spacing.md,
  },
  breakdownSection: {
    marginVertical: spacing.md,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: spacing.md,
  },
  savingsLabel: {
    color: '#4CAF50',
  },
  savingsValue: {
    color: '#4CAF50',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: spacing.sm,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: -1,
  },
  actionsContainer: {
    backgroundColor: '#FFF',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
});
