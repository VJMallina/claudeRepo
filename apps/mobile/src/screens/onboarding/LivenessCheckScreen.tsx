import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import kycService from '@/services/kyc.service';
import { spacing, typography } from '@/theme/theme';

type LivenessCheckScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'LivenessCheck'>;
  route: RouteProp<OnboardingStackParamList, 'LivenessCheck'>;
};

export default function LivenessCheckScreen({ navigation, route }: LivenessCheckScreenProps) {
  const { aadhaarNumber } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  const handleStartLiveness = async () => {
    try {
      setIsLoading(true);

      // In production, this would open camera and capture selfie
      // For now, we'll use a mock base64 image
      const mockSelfie = 'mock_base64_selfie_image';

      await kycService.verifyLiveness({
        selfieImage: mockSelfie,
        aadhaarNumber,
      });

      navigation.navigate('BankAccount');
    } catch (err: any) {
      console.error('Liveness check failed:', err);
      alert(err.response?.data?.message || 'Liveness verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🤳</Text>
        <Text style={styles.title}>Liveness Check</Text>
        <Text style={styles.subtitle}>Take a selfie to verify your identity</Text>
      </View>

      <View style={styles.instructions}>
        <InstructionItem number="1" text="Position your face in the center" />
        <InstructionItem number="2" text="Ensure good lighting" />
        <InstructionItem number="3" text="Remove glasses if possible" />
        <InstructionItem number="4" text="Follow on-screen prompts" />
      </View>

      <Button
        mode="contained"
        onPress={handleStartLiveness}
        loading={isLoading}
        disabled={isLoading}
        style={styles.button}
        contentStyle={styles.buttonContent}
        icon="camera"
      >
        Start Liveness Check
      </Button>

      <View style={styles.progress}>
        <Text style={styles.progressText}>Step 4 of 5</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '80%' }]} />
        </View>
      </View>
    </ScrollView>
  );
}

function InstructionItem({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.instructionItem}>
      <View style={styles.numberCircle}>
        <Text style={styles.numberText}>{number}</Text>
      </View>
      <Text style={styles.instructionText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: spacing.lg, backgroundColor: '#FFFFFF' },
  header: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  emoji: { fontSize: 64, marginBottom: spacing.md },
  title: { ...typography.h2, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body1, color: '#666666', textAlign: 'center' },
  instructions: { marginBottom: spacing.xl },
  instructionItem: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  numberCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6200EE', justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  numberText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  instructionText: { ...typography.body1, flex: 1 },
  button: { marginTop: spacing.xl },
  buttonContent: { paddingVertical: spacing.sm },
  progress: { marginTop: 'auto', paddingTop: spacing.xl },
  progressText: { ...typography.caption, color: '#666666', textAlign: 'center', marginBottom: spacing.sm },
  progressBar: { height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6200EE' },
});
