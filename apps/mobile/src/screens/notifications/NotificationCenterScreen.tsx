import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, IconButton, Badge, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EmptyState, LoadingSpinner } from '@/components';
import { spacing, typography } from '@/theme/theme';
import { format } from 'date-fns';

type NotificationCenterScreenProps = {
  navigation: NativeStackNavigationProp<any, 'NotificationCenter'>;
};

interface Notification {
  id: string;
  type: 'TRANSACTION' | 'SAVINGS' | 'INVESTMENT' | 'SECURITY' | 'GOAL' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationCenterScreen({
  navigation,
}: NotificationCenterScreenProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'TRANSACTION',
      title: 'Payment Successful',
      message: '₹500 paid to Merchant via UPI. ₹50 saved automatically!',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'SAVINGS',
      title: 'Savings Milestone',
      message: 'Congratulations! You\'ve saved ₹5,000 this month 🎉',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      type: 'INVESTMENT',
      title: 'Investment Update',
      message: 'Your portfolio is up 5.2% this week! Keep going! 📈',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeColor = (type: Notification['type']) => {
    const colors = {
      TRANSACTION: '#2196F3',
      SAVINGS: '#4CAF50',
      INVESTMENT: '#FF9800',
      SECURITY: '#F44336',
      GOAL: '#9C27B0',
      SYSTEM: '#607D8B',
    };
    return colors[type];
  };

  const getTypeIcon = (type: Notification['type']) => {
    const icons = {
      TRANSACTION: '💳',
      SAVINGS: '💰',
      INVESTMENT: '📈',
      SECURITY: '🔒',
      GOAL: '🎯',
      SYSTEM: 'ℹ️',
    };
    return icons[type];
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => handleMarkAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationTitleContainer}>
          <Text style={styles.notificationIcon}>{getTypeIcon(item.type)}</Text>
          <View style={styles.notificationTitleContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationTime}>
              {format(new Date(item.createdAt), 'MMM dd, HH:mm')}
            </Text>
          </View>
        </View>
        {!item.isRead && <Badge size={8} style={styles.unreadBadge} />}
      </View>

      <Text style={styles.notificationMessage}>{item.message}</Text>

      <View style={styles.notificationFooter}>
        <Chip
          mode="outlined"
          style={[styles.typeChip, { borderColor: getTypeColor(item.type) }]}
          textStyle={[styles.typeChipText, { color: getTypeColor(item.type) }]}
        >
          {item.type}
        </Chip>
        <IconButton
          icon="delete"
          size={20}
          iconColor="#999"
          onPress={() => handleDelete(item.id)}
        />
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading notifications..." />;
  }

  if (notifications.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="🔔"
          title="No Notifications"
          message="You're all caught up! New notifications will appear here."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.filterContainer}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={filter === 'unread'}
            onPress={() => setFilter('unread')}
            style={styles.filterChip}
          >
            Unread ({unreadCount})
          </Chip>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllButton}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    marginRight: spacing.sm,
  },
  markAllButton: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: spacing.md,
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  unreadCard: {
    backgroundColor: '#F3F4F6',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  notificationTitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  notificationTitleContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: '#333',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadBadge: {
    backgroundColor: '#4CAF50',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeChip: {
    height: 28,
  },
  typeChipText: {
    fontSize: 12,
  },
});
