import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SecurityService from '@/services/security.service';
import type { SecurityAlert } from '@/services/security.service';
import { spacing, typography } from '@/theme/theme';

type SecurityAlertsScreenProps = NativeStackScreenProps<any, 'SecurityAlerts'>;

export default function SecurityAlertsScreen({ navigation }: SecurityAlertsScreenProps) {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const result = await SecurityService.getSecurityAlerts(50);
      setAlerts(result);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await SecurityService.acknowledgeAlert(alertId);
      setAlerts(prev => prev.map(a =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ));
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '#D32F2F';
      case 'HIGH':
        return '#F57C00';
      case 'MEDIUM':
        return '#FBC02D';
      case 'LOW':
        return '#388E3C';
      default:
        return '#757575';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Security Alerts</Text>
        <Text style={styles.subtitle}>
          Recent security notifications and events
        </Text>

        {alerts.map((alert) => (
          <Card
            key={alert.id}
            style={[
              styles.card,
              alert.acknowledged && styles.acknowledgedCard,
            ]}
          >
            <Card.Content>
              <View style={styles.alertHeader}>
                <View style={styles.headerLeft}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Chip
                    mode="flat"
                    textStyle={{ color: getSeverityColor(alert.severity), fontSize: 12 }}
                    style={[styles.chip, { borderColor: getSeverityColor(alert.severity) }]}
                  >
                    {alert.severity}
                  </Chip>
                </View>
                {!alert.acknowledged && (
                  <IconButton
                    icon="check"
                    size={20}
                    onPress={() => handleAcknowledge(alert.id)}
                  />
                )}
              </View>

              <Text style={styles.description}>{alert.description}</Text>
              <Text style={styles.timestamp}>
                {new Date(alert.timestamp).toLocaleString()}
              </Text>
            </Card.Content>
          </Card>
        ))}

        {alerts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No security alerts</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body1,
    marginTop: spacing.md,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body2,
    color: '#666',
    marginBottom: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  acknowledgedCard: {
    opacity: 0.7,
    backgroundColor: '#FAFAFA',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  alertTitle: {
    ...typography.body1,
    fontWeight: '600',
    flex: 1,
  },
  chip: {
    height: 24,
    borderWidth: 1,
  },
  description: {
    ...typography.body2,
    color: '#666',
    marginBottom: spacing.sm,
  },
  timestamp: {
    ...typography.caption,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body1,
    color: '#999',
  },
});
