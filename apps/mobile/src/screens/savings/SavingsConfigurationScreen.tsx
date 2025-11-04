import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Switch, Button, TextInput, HelperText, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Slider from '@react-native-community/slider';
import { spacing, typography } from '../../theme/theme';
import savingsService from '../../services/savings.service';

type RootStackParamList = {
  SavingsConfiguration: undefined;
};

type SavingsConfigurationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SavingsConfiguration'
>;

export default function SavingsConfigurationScreen({
  navigation,
}: SavingsConfigurationScreenProps) {
  const [enabled, setEnabled] = useState(true);
  const [percentage, setPercentage] = useState(10);
  const [minPaymentAmount, setMinPaymentAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const config = await savingsService.getConfiguration();
      setEnabled(config.enabled);
      setPercentage(config.percentage);
      setMinPaymentAmount(config.minPaymentAmount.toString());
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate min payment amount
    const minAmount = parseFloat(minPaymentAmount);
    if (isNaN(minAmount) || minAmount < 0) {
      setError('Please enter a valid minimum amount');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await savingsService.updateConfiguration({
        enabled,
        percentage,
        minPaymentAmount: minAmount,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateSavings = (paymentAmount: number) => {
    return (paymentAmount * percentage) / 100;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Auto-Save Configuration</Text>
        <Text style={styles.subtitle}>
          Set up automatic savings on every payment
        </Text>
      </View>

      {/* Enable/Disable */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.switchRow}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchLabel}>Enable Auto-Save</Text>
              <Text style={styles.switchDescription}>
                Automatically save a percentage on every payment
              </Text>
            </View>
            <Switch value={enabled} onValueChange={setEnabled} />
          </View>
        </Card.Content>
      </Card>

      {enabled && (
        <>
          {/* Savings Percentage */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Savings Percentage</Text>
              <Text style={styles.cardSubtitle}>
                How much should we save from each payment?
              </Text>

              <View style={styles.percentageDisplay}>
                <Text style={styles.percentageValue}>{percentage}%</Text>
              </View>

              <Slider
                value={percentage}
                onValueChange={setPercentage}
                minimumValue={0}
                maximumValue={50}
                step={1}
                minimumTrackTintColor="#6200EE"
                maximumTrackTintColor="#E0E0E0"
                thumbTintColor="#6200EE"
                style={styles.slider}
              />

              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>0%</Text>
                <Text style={styles.sliderLabel}>50%</Text>
              </View>

              <Divider style={styles.divider} />

              {/* Preview Calculation */}
              <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>Preview</Text>

                {[100, 500, 1000, 5000].map((amount) => (
                  <View key={amount} style={styles.previewRow}>
                    <Text style={styles.previewLabel}>₹{amount.toLocaleString('en-IN')} payment</Text>
                    <Text style={styles.previewValue}>
                      saves ₹{calculateSavings(amount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>

          {/* Minimum Payment Amount */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Minimum Payment Amount</Text>
              <Text style={styles.cardSubtitle}>
                Auto-save only when payment is above this amount
              </Text>

              <TextInput
                label="Minimum Amount"
                value={minPaymentAmount}
                onChangeText={(value) => {
                  setMinPaymentAmount(value.replace(/[^0-9.]/g, ''));
                  if (error) setError(null);
                }}
                mode="outlined"
                keyboardType="decimal-pad"
                left={<TextInput.Affix text="₹" />}
                error={!!error}
                style={styles.input}
              />
              {error && (
                <HelperText type="error" visible={!!error}>
                  {error}
                </HelperText>
              )}
              <HelperText type="info">
                Auto-save will not trigger for payments below this amount
              </HelperText>
            </Card.Content>
          </Card>

          {/* Info Card */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.infoTitle}>How Auto-Save Works</Text>

              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  When you make a payment, we automatically calculate and save the configured percentage
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  The savings amount is transferred from your payment to your savings wallet
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  You can withdraw your savings to your bank account anytime (requires KYC Level 2)
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoBullet}>•</Text>
                <Text style={styles.infoText}>
                  You can also invest your savings in mutual funds for better returns
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Savings Goal Example */}
          <Card style={styles.goalCard}>
            <Card.Content>
              <Text style={styles.goalTitle}>Monthly Savings Goal</Text>
              <Text style={styles.goalSubtitle}>
                Based on your current settings
              </Text>

              <View style={styles.goalCalculation}>
                <View style={styles.goalRow}>
                  <Text style={styles.goalLabel}>If you spend ₹10,000/month</Text>
                  <Text style={styles.goalValue}>
                    You'll save ₹{calculateSavings(10000).toLocaleString('en-IN')}/month
                  </Text>
                </View>

                <View style={styles.goalRow}>
                  <Text style={styles.goalLabel}>Annual savings</Text>
                  <Text style={[styles.goalValue, styles.goalHighlight]}>
                    ₹{(calculateSavings(10000) * 12).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <Text style={styles.goalNote}>
                These are estimates based on assumed spending. Actual savings will vary.
              </Text>
            </Card.Content>
          </Card>
        </>
      )}

      {/* Save Button */}
      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving || loading}
        style={styles.saveButton}
        contentStyle={styles.buttonContent}
      >
        Save Configuration
      </Button>

      {!enabled && (
        <Card style={styles.disabledCard}>
          <Card.Content>
            <Text style={styles.disabledText}>
              Auto-save is currently disabled. Enable it to start saving automatically with every payment.
            </Text>
          </Card.Content>
        </Card>
      )}
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
  card: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
  },
  cardTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
    color: '#212121',
  },
  cardSubtitle: {
    ...typography.body2,
    color: '#666',
    marginBottom: spacing.lg,
  },
  percentageDisplay: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  percentageValue: {
    fontSize: 48,
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
  },
  sliderLabel: {
    fontSize: 12,
    color: '#999',
  },
  divider: {
    marginVertical: spacing.lg,
  },
  previewSection: {
    marginTop: spacing.sm,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  input: {
    backgroundColor: '#FFF',
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    marginBottom: spacing.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  infoBullet: {
    fontSize: 16,
    color: '#1565C0',
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
  goalCard: {
    backgroundColor: '#F3E5F5',
    marginBottom: spacing.lg,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
    marginBottom: spacing.xs,
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#9C27B0',
    marginBottom: spacing.md,
  },
  goalCalculation: {
    marginBottom: spacing.md,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  goalLabel: {
    fontSize: 14,
    color: '#9C27B0',
  },
  goalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C27B0',
  },
  goalHighlight: {
    fontSize: 16,
    color: '#7B1FA2',
  },
  goalNote: {
    fontSize: 12,
    color: '#9C27B0',
    fontStyle: 'italic',
  },
  saveButton: {
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  buttonContent: {
    height: 48,
  },
  disabledCard: {
    backgroundColor: '#FFF3E0',
  },
  disabledText: {
    fontSize: 14,
    color: '#E65100',
    textAlign: 'center',
  },
});
