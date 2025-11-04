import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '@/screens/main/HomeScreen';
import PaymentsScreen from '@/screens/main/PaymentsScreen';
import SavingsScreen from '@/screens/main/SavingsScreen';
import InvestmentsScreen from '@/screens/main/InvestmentsScreen';
import ProfileScreen from '@/screens/main/ProfileScreen';
import QRScannerScreen from '@/screens/payment/QRScannerScreen';
import PaymentConfirmationScreen from '@/screens/payment/PaymentConfirmationScreen';
import PaymentSuccessScreen from '@/screens/payment/PaymentSuccessScreen';

export type MainTabParamList = {
  Home: undefined;
  Payments: undefined;
  Savings: undefined;
  Investments: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  QRScanner: undefined;
  PaymentConfirmation: {
    merchantUpiId: string;
    merchantName: string;
    amount: number | null;
  };
  PaymentSuccess: {
    payment: any;
    savingsAmount: number;
  };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="credit-card" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Savings"
        component={SavingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="piggy-bank" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Investments"
        component={InvestmentsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{
          headerShown: true,
          title: 'Scan QR Code',
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="PaymentConfirmation"
        component={PaymentConfirmationScreen}
        options={{
          headerShown: true,
          title: 'Confirm Payment',
        }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
