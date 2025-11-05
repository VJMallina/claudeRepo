import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { spacing, typography } from '@/theme/theme';

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using SaveInvest mobile application ("the App"), you accept and
          agree to be bound by the terms and provision of this agreement. If you do not
          agree to these Terms of Service, please do not use the App.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          SaveInvest provides an automated savings and investment platform that enables
          users to:
        </Text>
        <Text style={styles.listItem}>
          • Automatically save a percentage of UPI transactions
        </Text>
        <Text style={styles.listItem}>
          • Invest saved funds in various financial instruments
        </Text>
        <Text style={styles.listItem}>
          • Track savings and investment performance
        </Text>
        <Text style={styles.listItem}>
          • Manage financial goals
        </Text>

        <Text style={styles.sectionTitle}>3. User Registration</Text>
        <Text style={styles.paragraph}>
          To use our services, you must:
        </Text>
        <Text style={styles.listItem}>
          • Be at least 18 years of age
        </Text>
        <Text style={styles.listItem}>
          • Provide accurate and complete information
        </Text>
        <Text style={styles.listItem}>
          • Complete KYC (Know Your Customer) verification
        </Text>
        <Text style={styles.listItem}>
          • Link a valid bank account
        </Text>

        <Text style={styles.sectionTitle}>4. KYC Requirements</Text>
        <Text style={styles.paragraph}>
          We follow a progressive KYC system:
        </Text>
        <Text style={styles.listItem}>
          • Level 0: Basic registration (limited features)
        </Text>
        <Text style={styles.listItem}>
          • Level 1: PAN verification (payments up to ₹10,000)
        </Text>
        <Text style={styles.listItem}>
          • Level 2: Full KYC with Aadhaar and liveness check (full access)
        </Text>

        <Text style={styles.sectionTitle}>5. Investment Disclaimers</Text>
        <Text style={styles.paragraph}>
          • Investments are subject to market risks
        </Text>
        <Text style={styles.listItem}>
          • Past performance is not indicative of future results
        </Text>
        <Text style={styles.listItem}>
          • Please read all scheme-related documents carefully
        </Text>
        <Text style={styles.listItem}>
          • We do not guarantee returns on investments
        </Text>

        <Text style={styles.sectionTitle}>6. Fees and Charges</Text>
        <Text style={styles.paragraph}>
          SaveInvest may charge fees for certain services. All applicable fees will be
          disclosed to you before you complete a transaction. We reserve the right to
          change our fees upon notice to you.
        </Text>

        <Text style={styles.sectionTitle}>7. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You are responsible for:
        </Text>
        <Text style={styles.listItem}>
          • Maintaining the confidentiality of your account
        </Text>
        <Text style={styles.listItem}>
          • All activities under your account
        </Text>
        <Text style={styles.listItem}>
          • Ensuring accuracy of information provided
        </Text>
        <Text style={styles.listItem}>
          • Complying with all applicable laws
        </Text>

        <Text style={styles.sectionTitle}>8. Prohibited Activities</Text>
        <Text style={styles.paragraph}>
          You may not:
        </Text>
        <Text style={styles.listItem}>
          • Use the App for illegal purposes
        </Text>
        <Text style={styles.listItem}>
          • Attempt to gain unauthorized access
        </Text>
        <Text style={styles.listItem}>
          • Interfere with the proper working of the App
        </Text>
        <Text style={styles.listItem}>
          • Transmit viruses or malicious code
        </Text>

        <Text style={styles.sectionTitle}>9. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend your account immediately, without prior notice or
          liability, for any reason, including breach of these Terms.
        </Text>

        <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          SaveInvest shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages resulting from your use or inability to use
          the service.
        </Text>

        <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these terms at any time. We will notify users of
          any changes by posting the new Terms of Service on this page and updating the
          "Last Updated" date.
        </Text>

        <Text style={styles.sectionTitle}>12. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about these Terms, please contact us at:
          {'\n'}Email: legal@saveinvest.app
          {'\n'}Phone: +91-XXXXXXXXXX
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using SaveInvest, you acknowledge that you have read and understood these
            Terms of Service and agree to be bound by them.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight as any,
    marginBottom: spacing.sm,
    color: '#333',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    color: '#333',
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  listItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: spacing.xs,
    paddingLeft: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
  },
});
