import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, IconButton, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomCard, EmptyState, LoadingSpinner } from '@/components';
import { spacing, typography } from '@/theme/theme';
import savingsService from '@/services/savings.service';

type AutoInvestRulesScreenProps = {
  navigation: NativeStackNavigationProp<any, 'AutoInvestRules'>;
};

interface AutoInvestRule {
  id: string;
  product: {
    name: string;
    category: string;
  };
  enabled: boolean;
  triggerType: 'THRESHOLD' | 'SCHEDULED';
  triggerValue?: number;
  investmentPercentage?: number;
  investmentAmount?: number;
}

export default function AutoInvestRulesScreen({
  navigation,
}: AutoInvestRulesScreenProps) {
  const [rules, setRules] = useState<AutoInvestRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const response = await savingsService.getAutoInvestRules();
      setRules(response.data);
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await savingsService.updateAutoInvestRule(ruleId, { enabled });
      setRules((prev) =>
        prev.map((rule) =>
          rule.id === ruleId ? { ...rule, enabled } : rule
        )
      );
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await savingsService.deleteAutoInvestRule(ruleId);
      setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const renderRule = ({ item }: { item: AutoInvestRule }) => (
    <CustomCard
      style={styles.card}
      onPress={() =>
        navigation.navigate('EditAutoInvestRule', { ruleId: item.id })
      }
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle}>{item.product.name}</Text>
          <Chip
            mode="outlined"
            style={styles.categoryChip}
            textStyle={styles.chipText}
          >
            {item.product.category}
          </Chip>
        </View>
        <IconButton
          icon={item.enabled ? 'toggle-switch' : 'toggle-switch-off-outline'}
          iconColor={item.enabled ? '#4CAF50' : '#999'}
          size={28}
          onPress={() => handleToggleRule(item.id, !item.enabled)}
        />
      </View>

      <View style={styles.ruleDetails}>
        <View style={styles.ruleItem}>
          <Text style={styles.ruleLabel}>Trigger:</Text>
          <Text style={styles.ruleValue}>
            {item.triggerType === 'THRESHOLD'
              ? `When balance ≥ ₹${item.triggerValue?.toLocaleString('en-IN')}`
              : 'Scheduled'}
          </Text>
        </View>

        <View style={styles.ruleItem}>
          <Text style={styles.ruleLabel}>Investment:</Text>
          <Text style={styles.ruleValue}>
            {item.investmentPercentage
              ? `${item.investmentPercentage}% of savings`
              : `₹${item.investmentAmount?.toLocaleString('en-IN')}`}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <IconButton
          icon="pencil"
          size={20}
          onPress={() =>
            navigation.navigate('EditAutoInvestRule', { ruleId: item.id })
          }
        />
        <IconButton
          icon="delete"
          size={20}
          iconColor="#D32F2F"
          onPress={() => handleDeleteRule(item.id)}
        />
      </View>
    </CustomCard>
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading rules..." />;
  }

  if (rules.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="🤖"
          title="No Auto-Invest Rules"
          message="Create rules to automatically invest your savings when certain conditions are met"
          actionLabel="Create Rule"
          onAction={() => navigation.navigate('CreateAutoInvestRule')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How Auto-Invest Works</Text>
        <Text style={styles.infoText}>
          Set rules to automatically invest your savings based on thresholds or schedules.
          Your money grows while you focus on other things!
        </Text>
      </View>

      <FlatList
        data={rules}
        renderItem={renderRule}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateAutoInvestRule')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: 12,
    color: '#1565C0',
    lineHeight: 18,
  },
  list: {
    padding: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: '#333',
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 12,
  },
  ruleDetails: {
    marginBottom: spacing.md,
  },
  ruleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  ruleLabel: {
    fontSize: 14,
    color: '#666',
  },
  ruleValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: '#4CAF50',
  },
});
