import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, ProgressBar } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomCard, EmptyState, LoadingSpinner } from '@/components';
import { spacing, typography } from '@/theme/theme';
import { format, differenceInDays } from 'date-fns';

type SavingsGoalsScreenProps = {
  navigation: NativeStackNavigationProp<any, 'SavingsGoals'>;
};

interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  imageUrl?: string;
  allocationPercentage: number;
  status: 'ACTIVE' | 'ACHIEVED' | 'ARCHIVED';
}

export default function SavingsGoalsScreen({
  navigation,
}: SavingsGoalsScreenProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([
    {
      id: '1',
      name: 'Vacation Fund',
      targetAmount: 50000,
      currentAmount: 32000,
      targetDate: '2025-12-31',
      allocationPercentage: 40,
      status: 'ACTIVE',
    },
    {
      id: '2',
      name: 'Emergency Fund',
      targetAmount: 100000,
      currentAmount: 75000,
      targetDate: '2026-06-30',
      allocationPercentage: 60,
      status: 'ACTIVE',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const renderGoal = ({ item }: { item: SavingsGoal }) => {
    const progress = item.currentAmount / item.targetAmount;
    const daysRemaining = differenceInDays(new Date(item.targetDate), new Date());
    const isAchieved = item.status === 'ACHIEVED';

    return (
      <CustomCard
        style={styles.card}
        onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.goalIcon}>
            {isAchieved ? '🎉' : item.name.includes('Vacation') ? '✈️' : '💰'}
          </Text>
          <View style={styles.goalInfo}>
            <Text style={styles.goalName}>{item.name}</Text>
            <Text style={styles.goalDate}>
              {isAchieved
                ? 'Goal Achieved!'
                : `${daysRemaining} days remaining`}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currentAmount}>
            ₹{item.currentAmount.toLocaleString('en-IN')}
          </Text>
          <Text style={styles.targetAmount}>
            of ₹{item.targetAmount.toLocaleString('en-IN')}
          </Text>
        </View>

        <ProgressBar
          progress={Math.min(progress, 1)}
          color={isAchieved ? '#4CAF50' : '#2196F3'}
          style={styles.progressBar}
        />

        <View style={styles.footer}>
          <Text style={styles.progressText}>
            {(progress * 100).toFixed(0)}% complete
          </Text>
          <Text style={styles.allocationText}>
            {item.allocationPercentage}% of savings
          </Text>
        </View>
      </CustomCard>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading goals..." />;
  }

  if (goals.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="🎯"
          title="No Savings Goals"
          message="Create savings goals and track your progress toward achieving them"
          actionLabel="Create Goal"
          onAction={() => navigation.navigate('CreateGoal')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Goals</Text>
        <Text style={styles.summaryValue}>{goals.length}</Text>
        <Text style={styles.summarySubtext}>
          {goals.filter((g) => g.status === 'ACTIVE').length} active
        </Text>
      </View>

      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGoal')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    backgroundColor: '#4CAF50',
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: spacing.sm,
  },
  summarySubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  list: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  goalIcon: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: '#333',
  },
  goalDate: {
    fontSize: 14,
    color: '#666',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  currentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: spacing.sm,
  },
  targetAmount: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  allocationText: {
    fontSize: 12,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: '#4CAF50',
  },
});
