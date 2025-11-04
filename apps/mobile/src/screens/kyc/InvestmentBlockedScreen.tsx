import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Card, Icon, ProgressBar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import onboardingService from '../../services/onboarding.service';
import { OnboardingStatus } from '../../types/api.types';

type RootStackParamList = {
  InvestmentBlocked: undefined;
  PanVerification: undefined;
  AadhaarVerification: undefined;
  LivenessCheck: undefined;
  BankAccount: undefined;
};

type InvestmentBlockedScreenProps = NativeStackScreenProps<RootStackParamList, 'InvestmentBlocked'>;

interface KYCStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  route: keyof RootStackParamList;
  icon: string;
}

export default function InvestmentBlockedScreen({ navigation }: InvestmentBlockedScreenProps) {
  const { user } = useAuthStore();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOnboardingStatus();
  }, []);

  const loadOnboardingStatus = async () => {
    try {
      setLoading(true);
      const status = await onboardingService.getStatus();
      setOnboardingStatus(status);
    } catch (error) {
      console.error('Failed to load onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKYCSteps = (): KYCStep[] => {
    if (!onboardingStatus) return [];

    return [
      {
        id: 'pan',
        title: 'PAN Verification',
        description: 'Verify your PAN card details',
        completed: onboardingStatus.kycLevel >= 1,
        route: 'PanVerification',
        icon: 'card-account-details',
      },
      {
        id: 'aadhaar',
        title: 'Aadhaar Verification',
        description: 'Verify your Aadhaar via OTP',
        completed: onboardingStatus.currentStep === 'LIVENESS_CHECK' ||
                   onboardingStatus.currentStep === 'BANK_ACCOUNT' ||
                   onboardingStatus.currentStep === 'DASHBOARD',
        route: 'AadhaarVerification',
        icon: 'card-account-details-outline',
      },
      {
        id: 'liveness',
        title: 'Liveness Check',
        description: 'Take a quick selfie for verification',
        completed: onboardingStatus.currentStep === 'BANK_ACCOUNT' ||
                   onboardingStatus.currentStep === 'DASHBOARD',
        route: 'LivenessCheck',
        icon: 'face-recognition',
      },
      {
        id: 'bank',
        title: 'Bank Account',
        description: 'Add your bank account for withdrawals',
        completed: onboardingStatus.kycLevel === 2,
        route: 'BankAccount',
        icon: 'bank',
      },
    ];
  };

  const kycSteps = getKYCSteps();
  const completedSteps = kycSteps.filter(step => step.completed).length;
  const totalSteps = kycSteps.length;
  const progress = totalSteps > 0 ? completedSteps / totalSteps : 0;
  const nextStep = kycSteps.find(step => !step.completed);

  const handleCompleteKYC = () => {
    if (nextStep) {
      navigation.navigate(nextStep.route);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Icon source="shield-lock" size={64} color="#FF9800" />
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Complete Your KYC</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Investment features require Level 2 KYC verification
      </Text>

      {/* Progress Card */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>KYC Progress</Text>
            <Text style={styles.progressText}>{completedSteps}/{totalSteps} Steps</Text>
          </View>

          <ProgressBar
            progress={progress}
            color="#4CAF50"
            style={styles.progressBar}
          />

          <Text style={styles.progressSubtext}>
            {progress === 1 ? 'All steps completed!' : `${Math.round(progress * 100)}% complete`}
          </Text>
        </Card.Content>
      </Card>

      {/* KYC Steps */}
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsTitle}>Required Steps</Text>

        {kycSteps.map((step, index) => (
          <View key={step.id}>
            <Card style={[
              styles.stepCard,
              step.completed && styles.stepCardCompleted,
              !step.completed && nextStep?.id === step.id && styles.stepCardNext,
            ]}>
              <Card.Content style={styles.stepContent}>
                <View style={styles.stepIconContainer}>
                  <Icon
                    source={step.completed ? 'check-circle' : step.icon}
                    size={32}
                    color={step.completed ? '#4CAF50' : (nextStep?.id === step.id ? '#FF9800' : '#999')}
                  />
                </View>

                <View style={styles.stepTextContainer}>
                  <Text style={[
                    styles.stepTitle,
                    step.completed && styles.stepTitleCompleted,
                  ]}>
                    {step.title}
                  </Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>

                  {step.completed && (
                    <View style={styles.completedBadge}>
                      <Icon source="check" size={14} color="#FFF" />
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  )}

                  {!step.completed && nextStep?.id === step.id && (
                    <View style={styles.nextBadge}>
                      <Text style={styles.nextText}>Next Step</Text>
                    </View>
                  )}
                </View>

                {!step.completed && (
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>

            {index < kycSteps.length - 1 && (
              <View style={styles.stepConnector} />
            )}
          </View>
        ))}
      </View>

      {/* Benefits */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>What You'll Unlock</Text>

        <View style={styles.benefitRow}>
          <Icon source="chart-line" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>Invest in mutual funds</Text>
        </View>

        <View style={styles.benefitRow}>
          <Icon source="cash-multiple" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>Withdraw your savings to bank</Text>
        </View>

        <View style={styles.benefitRow}>
          <Icon source="finance" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>Track your investment portfolio</Text>
        </View>

        <View style={styles.benefitRow}>
          <Icon source="shield-check" size={20} color="#4CAF50" />
          <Text style={styles.benefitText}>Full account features</Text>
        </View>
      </View>

      {/* Info Note */}
      <Card style={styles.noteCard}>
        <Card.Content style={styles.noteContent}>
          <Icon source="information" size={20} color="#1976D2" />
          <Text style={styles.noteText}>
            As per SEBI guidelines, investment products require complete KYC verification.
            The process takes less than 5 minutes.
          </Text>
        </Card.Content>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {nextStep && (
          <Button
            mode="contained"
            onPress={handleCompleteKYC}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
          >
            {completedSteps === 0 ? 'Start KYC' : 'Continue KYC'}
          </Button>
        )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#FFF3E0',
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
  progressCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressTitle: {
    ...typography.h3,
    color: '#212121',
  },
  progressText: {
    ...typography.body1,
    fontWeight: '600',
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: spacing.sm,
  },
  progressSubtext: {
    ...typography.body2,
    color: '#999',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  stepsContainer: {
    marginBottom: spacing.lg,
  },
  stepsTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: '#212121',
  },
  stepCard: {
    backgroundColor: '#FFF',
    marginBottom: 0,
  },
  stepCardCompleted: {
    backgroundColor: '#F1F8F4',
  },
  stepCardNext: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FF9800',
    borderWidth: 2,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  stepIconContainer: {
    marginRight: spacing.md,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  stepTitleCompleted: {
    color: '#4CAF50',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.xs,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  completedText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  nextBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF9800',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  nextText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  stepConnector: {
    width: 2,
    height: 16,
    backgroundColor: '#E0E0E0',
    marginLeft: 52,
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
