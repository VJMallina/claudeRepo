import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileSetupScreen from '@/screens/onboarding/ProfileSetupScreen';
import PanVerificationScreen from '@/screens/onboarding/PanVerificationScreen';
import AadhaarVerificationScreen from '@/screens/onboarding/AadhaarVerificationScreen';
import LivenessCheckScreen from '@/screens/onboarding/LivenessCheckScreen';
import BankAccountScreen from '@/screens/onboarding/BankAccountScreen';
import OnboardingCompleteScreen from '@/screens/onboarding/OnboardingCompleteScreen';

export type OnboardingStackParamList = {
  ProfileSetup: undefined;
  PanVerification: undefined;
  AadhaarVerification: undefined;
  LivenessCheck: { aadhaarNumber: string };
  BankAccount: undefined;
  OnboardingComplete: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ title: 'Complete Your Profile' }}
      />
      <Stack.Screen
        name="PanVerification"
        component={PanVerificationScreen}
        options={{ title: 'PAN Verification' }}
      />
      <Stack.Screen
        name="AadhaarVerification"
        component={AadhaarVerificationScreen}
        options={{ title: 'Aadhaar Verification' }}
      />
      <Stack.Screen
        name="LivenessCheck"
        component={LivenessCheckScreen}
        options={{ title: 'Liveness Verification' }}
      />
      <Stack.Screen
        name="BankAccount"
        component={BankAccountScreen}
        options={{ title: 'Add Bank Account' }}
      />
      <Stack.Screen
        name="OnboardingComplete"
        component={OnboardingCompleteScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
