import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, List, Button, Chip, ActivityIndicator } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SecurityService from '@/services/security.service';
import type { SecuritySession } from '@/services/security.service';
import { spacing, typography } from '@/theme/theme';

type SessionManagementScreenProps = NativeStackScreenProps<any, 'SessionManagement'>;

export default function SessionManagementScreen({ navigation }: SessionManagementScreenProps) {
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const result = await SecurityService.getActiveSessions();
      setSessions(result);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      Alert.alert('Error', 'Failed to load active sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    Alert.alert(
      'Terminate Session',
      'Are you sure you want to logout this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Terminate',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecurityService.terminateSession(sessionId);
              await loadSessions();
              Alert.alert('Success', 'Session terminated');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to terminate session');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading sessions...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Active Sessions</Text>
        <Text style={styles.subtitle}>
          Manage devices logged into your account
        </Text>

        {sessions.map((session) => (
          <Card key={session.id} style={styles.card}>
            <Card.Content>
              <View style={styles.sessionHeader}>
                <Text style={styles.platform}>
                  {session.deviceInfo.platform} - {session.deviceInfo.model}
                </Text>
                {session.isCurrentSession && (
                  <Chip mode="flat" textStyle={{ fontSize: 12 }}>
                    Current
                  </Chip>
                )}
              </View>

              <Text style={styles.detail}>OS: {session.deviceInfo.os}</Text>
              <Text style={styles.detail}>IP: {session.ipAddress}</Text>
              {session.location && (
                <Text style={styles.detail}>Location: {session.location}</Text>
              )}
              <Text style={styles.detail}>
                Last Active: {new Date(session.lastActivity).toLocaleString()}
              </Text>

              {!session.isCurrentSession && (
                <Button
                  mode="outlined"
                  onPress={() => handleTerminateSession(session.id)}
                  style={styles.terminateButton}
                  textColor="#F44336"
                >
                  Terminate
                </Button>
              )}
            </Card.Content>
          </Card>
        ))}

        {sessions.length === 0 && (
          <Text style={styles.emptyText}>No active sessions found</Text>
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  platform: {
    ...typography.body1,
    fontWeight: '600',
  },
  detail: {
    ...typography.caption,
    color: '#666',
    marginBottom: spacing.xs,
  },
  terminateButton: {
    marginTop: spacing.md,
    borderColor: '#F44336',
  },
  emptyText: {
    ...typography.body1,
    textAlign: 'center',
    color: '#999',
    marginTop: spacing.xl,
  },
});
