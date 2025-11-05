import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { spacing, typography } from '@/theme/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
  style?: ViewStyle;
}

export default function LoadingSpinner({
  message,
  size = 'large',
  fullScreen = false,
  style,
}: LoadingSpinnerProps) {
  const containerStyle = fullScreen
    ? [styles.container, styles.fullScreen]
    : [styles.container, style];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.body.fontSize,
    color: '#666',
    textAlign: 'center',
  },
});
