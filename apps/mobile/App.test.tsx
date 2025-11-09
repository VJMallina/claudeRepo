import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#6200EE' }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>SaveInvest</Text>
      <Text style={{ color: 'white', marginTop: 20 }}>App is working!</Text>
      <StatusBar style="light" />
    </View>
  );
}
