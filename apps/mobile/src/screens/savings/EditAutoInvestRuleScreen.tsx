import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, SegmentedButtons } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '@/theme/theme';

type EditAutoInvestRuleScreenProps = NativeStackScreenProps<any, 'EditAutoInvestRule'>;

export default function EditAutoInvestRuleScreen({ navigation, route }: EditAutoInvestRuleScreenProps) {
  const { rule } = route.params || {};

  const [thresholdAmount, setThresholdAmount] = useState(rule?.thresholdAmount?.toString() || '1000');
  const [investmentType, setInvestmentType] = useState<'percentage' | 'fixed'>(
    rule?.investmentType || 'percentage'
  );
  const [investmentValue, setInvestmentValue] = useState(
    rule?.investmentValue?.toString() || '50'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Validate
      if (investmentType === 'percentage' && (parseFloat(investmentValue) < 1 || parseFloat(investmentValue) > 100)) {
        Alert.alert('Error', 'Percentage must be between 1 and 100');
        return;
      }

      if (parseFloat(thresholdAmount) < 100) {
        Alert.alert('Error', 'Threshold amount must be at least ₹100');
        return;
      }

      // TODO: Call API to update rule
      // await apiService.put(`/auto-invest-rules/${rule.id}`, { ... });

      Alert.alert(
        'Success',
        'Auto-invest rule updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update rule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Rule',
      'Are you sure you want to delete this auto-invest rule?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);

              // TODO: Call API to delete rule
              // await apiService.delete(`/auto-invest-rules/${rule.id}`);

              Alert.alert(
                'Deleted',
                'Auto-invest rule deleted successfully',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete rule');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleTogglePause = async () => {
    const newStatus = rule?.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';

    Alert.alert(
      newStatus === 'PAUSED' ? 'Pause Rule' : 'Resume Rule',
      `Are you sure you want to ${newStatus === 'PAUSED' ? 'pause' : 'resume'} this rule?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus === 'PAUSED' ? 'Pause' : 'Resume',
          onPress: async () => {
            try {
              setIsLoading(true);

              // TODO: Call API to toggle status
              // await apiService.patch(`/auto-invest-rules/${rule.id}/status`, { status: newStatus });

              Alert.alert(
                'Success',
                `Rule ${newStatus === 'PAUSED' ? 'paused' : 'resumed'} successfully`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update status');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Edit Auto-Invest Rule</Text>
        <Text style={styles.subtitle}>
          Modify your automatic investment settings
        </Text>

        {/* Rule Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Investment Product</Text>
            <Text style={styles.value}>{rule?.productName || 'Gold 24K'}</Text>
          </Card.Content>
        </Card>

        {/* Threshold Amount */}
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Threshold Amount (₹)"
              value={thresholdAmount}
              onChangeText={(text) => setThresholdAmount(text.replace(/[^0-9]/g, ''))}
              mode="outlined"
              keyboardType="numeric"
              left={<TextInput.Affix text="₹" />}
              style={styles.input}
            />
            <Text style={styles.helperText}>
              Invest when savings reach this amount
            </Text>
          </Card.Content>
        </Card>

        {/* Investment Type */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Investment Type</Text>
            <SegmentedButtons
              value={investmentType}
              onValueChange={(value) => setInvestmentType(value as any)}
              buttons={[
                { value: 'percentage', label: 'Percentage' },
                { value: 'fixed', label: 'Fixed Amount' },
              ]}
              style={styles.segmentedButtons}
            />

            <TextInput
              label={investmentType === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'}
              value={investmentValue}
              onChangeText={(text) => setInvestmentValue(text.replace(/[^0-9]/g, ''))}
              mode="outlined"
              keyboardType="numeric"
              left={<TextInput.Affix text={investmentType === 'percentage' ? '%' : '₹'} />}
              style={styles.input}
            />
            <Text style={styles.helperText}>
              {investmentType === 'percentage'
                ? 'Percentage of savings to invest'
                : 'Fixed amount to invest'}
            </Text>
          </Card.Content>
        </Card>

        {/* Actions */}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
        >
          Save Changes
        </Button>

        <Button
          mode="outlined"
          onPress={handleTogglePause}
          disabled={isLoading}
          style={styles.button}
        >
          {rule?.status === 'ACTIVE' ? 'Pause Rule' : 'Resume Rule'}
        </Button>

        <Button
          mode="text"
          onPress={handleDelete}
          disabled={isLoading}
          textColor="#F44336"
          style={styles.button}
        >
          Delete Rule
        </Button>
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
  label: {
    ...typography.caption,
    color: '#666',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  value: {
    ...typography.body1,
    fontWeight: '600',
  },
  input: {
    marginBottom: spacing.sm,
  },
  helperText: {
    ...typography.caption,
    color: '#666',
  },
  segmentedButtons: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
});
