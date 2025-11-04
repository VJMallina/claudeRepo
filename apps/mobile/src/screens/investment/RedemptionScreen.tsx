import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Button, TextInput, HelperText, RadioButton, ActivityIndicator, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import { spacing, typography } from '../../theme/theme';
import { UserInvestment } from '../../types/api.types';
import investmentService from '../../services/investment.service';

type RootStackParamList = {
  Redemption: { investmentId: string };
  RedemptionSuccess: { amount: number; units: number; fundName: string };
};

type RedemptionScreenProps = NativeStackScreenProps<RootStackParamList, 'Redemption'>;

type RedemptionType = 'full' | 'partial';

export default function RedemptionScreen({ route, navigation }: RedemptionScreenProps) {
  const { investmentId } = route.params;
  const [investment, setInvestment] = useState<UserInvestment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [redemptionType, setRedemptionType] = useState<RedemptionType>('full');
  const [unitsToRedeem, setUnitsToRedeem] = useState('');
  const [unitsPercentage, setUnitsPercentage] = useState(100);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvestment();
  }, [investmentId]);

  useEffect(() => {
    if (investment && redemptionType === 'partial') {
      const calculatedUnits = (investment.units * unitsPercentage) / 100;
      setUnitsToRedeem(calculatedUnits.toFixed(4));
    }
  }, [unitsPercentage, redemptionType, investment]);

  const loadInvestment = async () => {
    try {
      setLoading(true);
      const data = await investmentService.getInvestmentById(investmentId);
      setInvestment(data);
      setUnitsToRedeem(data.units.toFixed(4));
    } catch (error) {
      console.error('Failed to load investment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitsChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setUnitsToRedeem(sanitized);
    if (error) setError(null);

    // Update slider
    if (investment) {
      const units = parseFloat(sanitized);
      if (!isNaN(units)) {
        const percentage = (units / investment.units) * 100;
        setUnitsPercentage(Math.min(100, Math.max(0, percentage)));
      }
    }
  };

  const handleRedeem = async () => {
    if (!investment) return;

    const units = parseFloat(unitsToRedeem);

    // Validations
    if (redemptionType === 'partial') {
      if (!unitsToRedeem || isNaN(units)) {
        setError('Please enter valid units');
        return;
      }

      if (units <= 0) {
        setError('Units must be greater than 0');
        return;
      }

      if (units > investment.units) {
        setError('Cannot redeem more units than you hold');
        return;
      }

      // Check if remaining units meet minimum threshold (if any)
      const remainingUnits = investment.units - units;
      const minUnits = investment.fund.minimumInvestment / investment.fund.currentNav;
      if (remainingUnits > 0 && remainingUnits < minUnits) {
        setError(`Remaining units must be at least ${minUnits.toFixed(4)} or redeem all units`);
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      const redemptionData = redemptionType === 'full'
        ? { investmentId, fullRedemption: true }
        : { investmentId, units };

      const result = await investmentService.redeemInvestment(redemptionData);

      const estimatedAmount = redemptionType === 'full'
        ? investment.currentValue
        : units * investment.fund.currentNav;

      navigation.navigate('RedemptionSuccess', {
        amount: estimatedAmount,
        units: redemptionType === 'full' ? investment.units : units,
        fundName: investment.fund.name,
      });
    } catch (error: any) {
      console.error('Failed to redeem:', error);
      setError(error.response?.data?.message || 'Redemption failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading investment...</Text>
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

  const estimatedAmount = redemptionType === 'full'
    ? investment.currentValue
    : parseFloat(unitsToRedeem || '0') * investment.fund.currentNav;

  const remainingUnits = investment.units - parseFloat(unitsToRedeem || '0');
  const remainingValue = remainingUnits * investment.fund.currentNav;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Redeem Investment</Text>
          <Text style={styles.subtitle}>Sell your mutual fund units</Text>
        </View>

        {/* Investment Summary */}
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.fundName}>{investment.fund.name}</Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Units Held</Text>
                <Text style={styles.summaryValue}>{investment.units.toFixed(4)}</Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Current Value</Text>
                <Text style={styles.summaryValue}>
                  ₹{investment.currentValue.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Current NAV</Text>
                <Text style={styles.summaryValue}>₹{investment.fund.currentNav.toFixed(4)}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Redemption Type */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Redemption Type</Text>

            <RadioButton.Group
              onValueChange={(value) => {
                setRedemptionType(value as RedemptionType);
                if (value === 'full') {
                  setUnitsToRedeem(investment.units.toFixed(4));
                  setUnitsPercentage(100);
                }
              }}
              value={redemptionType}
            >
              <RadioButton.Item label="Redeem All Units" value="full" />
              <RadioButton.Item label="Redeem Partial Units" value="partial" />
            </RadioButton.Group>
          </Card.Content>
        </Card>

        {/* Units Calculator */}
        {redemptionType === 'partial' && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Units to Redeem</Text>

              {/* Percentage Slider */}
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Select Percentage</Text>
                <Text style={styles.sliderValue}>{unitsPercentage.toFixed(0)}%</Text>
              </View>

              <Slider
                value={unitsPercentage}
                onValueChange={setUnitsPercentage}
                minimumValue={0}
                maximumValue={100}
                step={1}
                minimumTrackTintColor="#6200EE"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#6200EE"
                style={styles.slider}
              />

              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabelText}>0%</Text>
                <Text style={styles.sliderLabelText}>100%</Text>
              </View>

              {/* Units Input */}
              <TextInput
                label="Units"
                value={unitsToRedeem}
                onChangeText={handleUnitsChange}
                mode="outlined"
                keyboardType="decimal-pad"
                error={!!error}
                style={styles.input}
              />
              {error && (
                <HelperText type="error" visible={!!error}>
                  {error}
                </HelperText>
              )}
              <HelperText type="info">
                Maximum: {investment.units.toFixed(4)} units
              </HelperText>

              {/* Quick Percentage Buttons */}
              <View style={styles.quickPercentages}>
                {[25, 50, 75, 100].map((percentage) => (
                  <Button
                    key={percentage}
                    mode="outlined"
                    onPress={() => setUnitsPercentage(percentage)}
                    compact
                    style={styles.quickButton}
                  >
                    {percentage}%
                  </Button>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Estimated Proceeds */}
        <Card style={styles.estimateCard}>
          <Card.Content>
            <Text style={styles.estimateTitle}>Estimated Proceeds</Text>

            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>Units to Redeem</Text>
              <Text style={styles.estimateValue}>
                {redemptionType === 'full'
                  ? investment.units.toFixed(4)
                  : unitsToRedeem || '0.0000'}
              </Text>
            </View>

            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>NAV (Estimated)</Text>
              <Text style={styles.estimateValue}>₹{investment.fund.currentNav.toFixed(4)}</Text>
            </View>

            <View style={[styles.estimateRow, styles.estimateRowHighlight]}>
              <Text style={styles.estimateLabelBold}>Estimated Amount</Text>
              <Text style={styles.estimateValueBold}>
                ₹{estimatedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {redemptionType === 'partial' && remainingUnits > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.estimateRow}>
                  <Text style={styles.estimateLabel}>Remaining Units</Text>
                  <Text style={styles.estimateValue}>{remainingUnits.toFixed(4)}</Text>
                </View>

                <View style={styles.estimateRow}>
                  <Text style={styles.estimateLabel}>Remaining Value</Text>
                  <Text style={styles.estimateValue}>
                    ₹{remainingValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Important Info */}
        <Card style={styles.warningCard}>
          <Card.Content style={styles.warningContent}>
            <Icon source="alert" size={20} color="#F57C00" />
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningTitle}>Important Information</Text>
              <Text style={styles.warningText}>
                • Redemption proceeds will be credited to your bank account{'\n'}
                • Processing time: 3-5 business days{'\n'}
                • Exit load may apply as per fund rules{'\n'}
                • NAV on redemption date will be final
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Error Message */}
        {error && (
          <Card style={styles.errorCard}>
            <Card.Content style={styles.errorCardContent}>
              <Icon source="alert-circle" size={20} color="#F44336" />
              <Text style={styles.errorCardText}>{error}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleRedeem}
          loading={submitting}
          disabled={submitting || (redemptionType === 'partial' && !unitsToRedeem)}
          style={styles.submitButton}
          contentStyle={styles.buttonContent}
        >
          Proceed to Redeem
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
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
  summaryCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  fundName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  card: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: '#212121',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6200EE',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#999',
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: spacing.sm,
  },
  quickPercentages: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickButton: {
    flex: 1,
  },
  estimateCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#E3F2FD',
  },
  estimateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: spacing.md,
  },
  estimateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  estimateRowHighlight: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#90CAF9',
  },
  estimateLabel: {
    fontSize: 14,
    color: '#1565C0',
  },
  estimateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
  },
  estimateLabelBold: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D47A1',
  },
  estimateValueBold: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D47A1',
  },
  divider: {
    height: 1,
    backgroundColor: '#90CAF9',
    marginVertical: spacing.md,
  },
  warningCard: {
    backgroundColor: '#FFF3E0',
    marginBottom: spacing.lg,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: 13,
    color: '#E65100',
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    marginBottom: spacing.lg,
  },
  errorCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorCardText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    color: '#C62828',
  },
  submitButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
});
