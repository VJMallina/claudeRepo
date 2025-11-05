import React from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { spacing } from '@/theme/theme';

interface CustomCardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: number;
  mode?: 'elevated' | 'outlined' | 'contained';
}

export default function CustomCard({
  title,
  subtitle,
  children,
  onPress,
  style,
  elevation = 2,
  mode = 'elevated',
}: CustomCardProps) {
  return (
    <Card
      style={[styles.card, style]}
      onPress={onPress}
      elevation={elevation}
      mode={mode}
    >
      {(title || subtitle) && (
        <Card.Title
          title={title}
          subtitle={subtitle}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
        />
      )}
      {children && <Card.Content style={styles.content}>{children}</Card.Content>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    paddingTop: spacing.sm,
  },
});
