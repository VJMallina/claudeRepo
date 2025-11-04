import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, Icon } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';

type RootStackParamList = {
  PaymentBlocked: {
    attemptedAmount: number;
    merchantName?: string;
  };
  PanVerification: undefined;
};

type PaymentBlockedScreenProps = NativeStackScreenProps<RootStackParamList, 'PaymentBlocked'>;

export default function PaymentBlockedScreen({ route, navigation }: PaymentBlockedScreenProps) {
  const { attemptedAmount, merchantName } = route.params;

  const handleVerifyPan = () => {
    navigation.navigate('PanVerification');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Icon source="lock" size={64} color="#F44336" />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Payment Limit Reached</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Complete PAN verification to unlock unlimited payments
      </Text>

      {/* Info Card */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Attempted Amount:</Text>
            <Text style={styles.infoValue}>₹{attemptedAmount.toLocaleString('en-IN')}</Text>
          </View>

          {merchantName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Merchant:</Text>
              <Text style={styles.infoValue}>{merchantName}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.limitInfoContainer}>
            <View style={styles.limitRow}>
              <View style={styles.limitDot} />
              <View style={styles.limitTextContainer}>
                <Text style={styles.limitTitle}>Current Limit</Text>
                <Text style={styles.limitAmount}>₹10,000 per payment</Text>
                <Text style={styles.limitSubtext}>Without PAN verification</Text>
              </View>
            </View>

            <View style={styles.arrow}>
              <Icon source="arrow-down" size={24} color="#666" />
            </View>

            <View style={styles.limitRow}>
              <View style={[styles.limitDot, styles.limitDotSuccess]} />
              <View style={styles.limitTextContainer}>
                <Text style={styles.limitTitle}>After PAN Verification</Text>
                <Text style={[styles.limitAmount, styles.unlimitedText]}>Unlimited Payments</Text>
                <Text style={styles.limitSubtext}>Complete KYC Level 1</Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Benefits */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Benefits of PAN Verification</Text>

        <View style={styles.benefitRow}>
          <Icon source="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>Unlimited payment amounts</Text>
        </View>

        <View style={styles.benefitRow}>
          <Icon source="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>Instant verification (under 30 seconds)</Text>
        </View>

        <View style={styles.benefitRow}>
          <Icon source="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>No document upload required</Text>
        </View>

        <View style={styles.benefitRow}>
          <Icon source="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>One-time verification</Text>
        </View>
      </View>

      {/* Info Note */}
      <Card style={styles.noteCard}>
        <Card.Content style={styles.noteContent}>
          <Icon source="information" size={20} color="#1976D2" />
          <Text style={styles.noteText}>
            As per RBI guidelines, payments above ₹10,000 require KYC verification
          </Text>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <Button
          mode="contained"
          onPress={handleVerifyPan}
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
        >
          Verify PAN Now
        </Button>

        <Button
          mode="outlined"
          onPress={handleGoBack}
          style={styles.secondaryButton}
          contentStyle={styles.buttonContent}
        >
          Go Back
        </Button>
      </View>
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
  iconContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: '#212121',
  },
  subtitle: {
    ...typography.body1,
    textAlign: 'center',
    color: '#666',
    marginBottom: spacing.xl,
  },
  infoCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.body1,
    color: '#666',
  },
  infoValue: {
    ...typography.body1,
    fontWeight: '600',
    color: '#212121',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: spacing.md,
  },
  limitInfoContainer: {
    marginTop: spacing.sm,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  limitDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
    marginTop: 4,
    marginRight: spacing.md,
  },
  limitDotSuccess: {
    backgroundColor: '#4CAF50',
  },
  limitTextContainer: {
    flex: 1,
  },
  limitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  limitAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F44336',
    marginBottom: 2,
  },
  unlimitedText: {
    color: '#4CAF50',
  },
  limitSubtext: {
    fontSize: 12,
    color: '#999',
  },
  arrow: {
    alignItems: 'flex-start',
    marginLeft: 6,
    marginBottom: spacing.sm,
  },
  benefitsContainer: {
    marginBottom: spacing.lg,
  },
  benefitsTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: '#212121',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    ...typography.body1,
    marginLeft: spacing.sm,
    color: '#424242',
  },
  noteCard: {
    backgroundColor: '#E3F2FD',
    marginBottom: spacing.xl,
  },
  noteContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noteText: {
    ...typography.body2,
    marginLeft: spacing.sm,
    flex: 1,
    color: '#1565C0',
  },
  actionContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    borderRadius: 8,
  },
  secondaryButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
});
