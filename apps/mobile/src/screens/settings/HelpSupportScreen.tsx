import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, Card, List, Divider, Button } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';

type RootStackParamList = {
  HelpSupport: undefined;
};

type HelpSupportScreenProps = NativeStackScreenProps<RootStackParamList, 'HelpSupport'>;

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'How does auto-save work?',
    answer: 'Auto-save automatically transfers a percentage of each payment to your savings wallet. You can configure the percentage (0-50%) in Settings. The saved amount is instantly available in your savings wallet.',
  },
  {
    question: 'What is Progressive KYC?',
    answer: 'Progressive KYC allows you to start using the app with minimal verification. Level 0: No KYC (payments up to ₹10,000). Level 1: PAN verified (unlimited payments). Level 2: Full KYC (investments and withdrawals).',
  },
  {
    question: 'How do I withdraw my savings?',
    answer: 'Navigate to Savings → Withdraw. Select your bank account, enter the amount, and confirm. Withdrawals take 1-2 business days to reflect in your account. Minimum withdrawal is ₹100.',
  },
  {
    question: 'How do investments work?',
    answer: 'You can invest your savings in mutual funds. Browse available funds, check their performance, and invest directly from your savings wallet. Requires Level 2 KYC. Redemptions take 3-5 business days.',
  },
  {
    question: 'Is my money safe?',
    answer: 'Yes. Your savings are held in secure escrow accounts. We use bank-grade encryption (AES-256) and follow RBI guidelines. All transactions are secured with SSL/TLS encryption.',
  },
  {
    question: 'What are the fees?',
    answer: 'No fees for deposits, withdrawals, or auto-save. Investment fees depend on the mutual fund chosen (typically 0.5-2% annual expense ratio). No hidden charges.',
  },
  {
    question: 'How do I verify my KYC?',
    answer: 'Tap on the KYC banner in your dashboard. Follow the steps: PAN verification → Aadhaar verification → Liveness check → Bank account addition. The entire process takes less than 5 minutes.',
  },
  {
    question: 'Can I change my auto-save percentage?',
    answer: 'Yes! Go to Savings → Configure. Adjust the slider between 0-50%. Changes apply to all future payments immediately.',
  },
];

export default function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handlePress = (index: number) => {
    setExpandedId(expandedId === index ? null : index);
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@saveinvest.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919876543210');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>Find answers to common questions</Text>
      </View>

      {/* Contact Options */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Contact Us</Text>

          <Button
            mode="outlined"
            icon="email"
            onPress={handleEmail}
            style={styles.contactButton}
          >
            Email: support@saveinvest.com
          </Button>

          <Button
            mode="outlined"
            icon="whatsapp"
            onPress={handleWhatsApp}
            style={styles.contactButton}
          >
            WhatsApp: +91 98765 43210
          </Button>

          <Button
            mode="outlined"
            icon="phone"
            onPress={() => Linking.openURL('tel:+919876543210')}
            style={styles.contactButton}
          >
            Call: 1800-123-4567 (Toll-free)
          </Button>
        </Card.Content>
      </Card>

      {/* FAQs */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          {faqs.map((faq, index) => (
            <View key={index}>
              <List.Accordion
                title={faq.question}
                titleNumberOfLines={2}
                expanded={expandedId === index}
                onPress={() => handlePress(index)}
                style={styles.accordion}
                titleStyle={styles.accordionTitle}
              >
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{faq.answer}</Text>
                </View>
              </List.Accordion>
              {index < faqs.length - 1 && <Divider />}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* App Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>App Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Support Email</Text>
            <Text style={styles.infoValue}>support@saveinvest.com</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Operating Hours</Text>
            <Text style={styles.infoValue}>24/7</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Legal Links */}
      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-lock" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Investment Disclaimers"
            left={props => <List.Icon {...props} icon="alert-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
    color: '#212121',
  },
  subtitle: {
    ...typography.body1,
    color: '#666',
  },
  card: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: '#212121',
  },
  contactButton: {
    marginBottom: spacing.sm,
    justifyContent: 'flex-start',
  },
  accordion: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  answerContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#FFF',
  },
  infoTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: '#212121',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
});
