import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';

// Navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loadUser } = useAuthStore();
  const { currentStep, fetchStatus } = useOnboardingStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load user session if exists
      await loadUser();

      // If authenticated, fetch onboarding status
      if (isAuthenticated) {
        await fetchStatus();
      }
    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  // Determine which navigator to show
  const getActiveNavigator = () => {
    if (!isAuthenticated) {
      return 'Auth';
    }

    // If onboarding is not complete, show onboarding flow
    if (currentStep !== 'DASHBOARD') {
      return 'Onboarding';
    }

    return 'Main';
  };

  const activeNavigator = getActiveNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {activeNavigator === 'Auth' && (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
        {activeNavigator === 'Onboarding' && (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        )}
        {activeNavigator === 'Main' && (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
