import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, RadioButton, SegmentedButtons } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomButton, CustomTextInput, BottomSheet } from '@/components';
import { spacing, typography } from '@/theme/theme';
import investmentService from '@/services/investment.service';
import savingsService from '@/services/savings.service';

type CreateAutoInvestRuleScreenProps = {
  navigation: NativeStackNavigationProp<any, 'CreateAutoInvestRule'>;
};

interface InvestmentProduct {
  id: string;
  name: string;
  category: string;
}

export default function CreateAutoInvestRuleScreen({
  navigation,
}: CreateAutoInvestRuleScreenProps) {
  const [triggerType, setTriggerType] = useState<'THRESHOLD' | 'SCHEDULED'>(
    'THRESHOLD'
  );
  const [products, setProducts] = useState<InvestmentProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<InvestmentProduct | null>(
    null
  );
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [thresholdAmount, setThresholdAmount] = useState('');
  const [investmentType, setInvestmentType] = useState<'percentage' | 'fixed'>(
    'percentage'
  );
  const [investmentPercentage, setInvestmentPercentage] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await investmentService.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const validate = (): boolean => {
    const newErrors: any = {};

    if (!selectedProduct) {
      newErrors.product = 'Please select an investment product';
    }

    if (triggerType === 'THRESHOLD') {
      if (!thresholdAmount || parseFloat(thresholdAmount) < 100) {
        newErrors.threshold = 'Threshold must be at least ₹100';
      }
    }

    if (investmentType === 'percentage') {
      const percentage = parseFloat(investmentPercentage);
      if (!investmentPercentage || percentage < 1 || percentage > 100) {
        newErrors.investment = 'Percentage must be between 1 and 100';
      }
    } else {
      if (!investmentAmount || parseFloat(investmentAmount) < 100) {
        newErrors.investment = 'Amount must be at least ₹100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateRule = async () => {
    if (!validate()) return;

    try {
      setIsLoading(true);
      const ruleData = {
        productId: selectedProduct!.id,
        triggerType,
        ...(triggerType === 'THRESHOLD' && {
          triggerValue: parseFloat(thresholdAmount),
        }),
        ...(investmentType === 'percentage'
          ? { investmentPercentage: parseFloat(investmentPercentage) }
          : { investmentAmount: parseFloat(investmentAmount) }),
      };

      await savingsService.createAutoInvestRule(ruleData);
      navigation.goBack();
    } catch (error: any) {
      console.error('Error creating rule:', error);
      setErrors({
        general: error.response?.data?.message || 'Failed to create rule',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Product</Text>
          <CustomButton
            mode="outlined"
            onPress={() => setShowProductPicker(true)}
            icon="chevron-down"
          >
            {selectedProduct ? selectedProduct.name : 'Select Product'}
          </CustomButton>
          {errors.product && (
            <Text style={styles.errorText}>{errors.product}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trigger Type</Text>
          <SegmentedButtons
            value={triggerType}
            onValueChange={(value) =>
              setTriggerType(value as 'THRESHOLD' | 'SCHEDULED')
            }
            buttons={[
              { value: 'THRESHOLD', label: 'Threshold' },
              { value: 'SCHEDULED', label: 'Scheduled' },
            ]}
          />

          {triggerType === 'THRESHOLD' && (
            <View style={styles.inputContainer}>
              <CustomTextInput
                label="Threshold Amount"
                value={thresholdAmount}
                onChangeText={setThresholdAmount}
                error={errors.threshold}
                keyboardType="numeric"
                placeholder="e.g., 1000"
                left={<Text style={styles.inputPrefix}>₹</Text>}
              />
              <Text style={styles.helperText}>
                Invest when savings balance reaches this amount
              </Text>
            </View>
          )}

          {triggerType === 'SCHEDULED' && (
            <View style={styles.inputContainer}>
              <Text style={styles.helperText}>
                Auto-invest will run on the 1st of every month
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Amount</Text>
          <SegmentedButtons
            value={investmentType}
            onValueChange={(value) =>
              setInvestmentType(value as 'percentage' | 'fixed')
            }
            buttons={[
              { value: 'percentage', label: 'Percentage' },
              { value: 'fixed', label: 'Fixed Amount' },
            ]}
          />

          {investmentType === 'percentage' ? (
            <View style={styles.inputContainer}>
              <CustomTextInput
                label="Percentage of Savings"
                value={investmentPercentage}
                onChangeText={setInvestmentPercentage}
                error={errors.investment}
                keyboardType="numeric"
                placeholder="e.g., 40"
                right={<Text style={styles.inputSuffix}>%</Text>}
              />
              <Text style={styles.helperText}>
                Invest this % of your savings wallet balance
              </Text>
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <CustomTextInput
                label="Fixed Amount"
                value={investmentAmount}
                onChangeText={setInvestmentAmount}
                error={errors.investment}
                keyboardType="numeric"
                placeholder="e.g., 500"
                left={<Text style={styles.inputPrefix}>₹</Text>}
              />
              <Text style={styles.helperText}>
                Invest this fixed amount each time
              </Text>
            </View>
          )}
        </View>

        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        <View style={styles.exampleCard}>
          <Text style={styles.exampleTitle}>Example:</Text>
          <Text style={styles.exampleText}>
            {triggerType === 'THRESHOLD'
              ? `When your savings reach ₹${thresholdAmount || '1000'}, `
              : 'On the 1st of every month, '}
            {investmentType === 'percentage'
              ? `${investmentPercentage || '40'}% of your balance`
              : `₹${investmentAmount || '500'}`}{' '}
            will be automatically invested in{' '}
            {selectedProduct?.name || 'the selected fund'}.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          mode="contained"
          onPress={handleCreateRule}
          loading={isLoading}
          disabled={isLoading}
        >
          Create Rule
        </CustomButton>
      </View>

      <BottomSheet
        visible={showProductPicker}
        onDismiss={() => setShowProductPicker(false)}
        title="Select Investment Product"
      >
        <RadioButton.Group
          value={selectedProduct?.id || ''}
          onValueChange={(value) => {
            const product = products.find((p) => p.id === value);
            if (product) {
              setSelectedProduct(product);
              setShowProductPicker(false);
            }
          }}
        >
          {products.map((product) => (
            <RadioButton.Item
              key={product.id}
              label={`${product.name} (${product.category})`}
              value={product.id}
            />
          ))}
        </RadioButton.Group>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: '#333',
  },
  inputContainer: {
    marginTop: spacing.md,
  },
  inputPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: spacing.md,
    lineHeight: 56,
  },
  inputSuffix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: spacing.md,
    lineHeight: 56,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: spacing.xs,
  },
  exampleCard: {
    backgroundColor: '#F1F8E9',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#558B2F',
    marginBottom: spacing.xs,
  },
  exampleText: {
    fontSize: 14,
    color: '#689F38',
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginTop: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
