import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { spacing, typography } from '@/theme/theme';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          SaveInvest ("we", "our", or "us") is committed to protecting your privacy. This
          Privacy Policy explains how we collect, use, disclose, and safeguard your
          information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>We collect information that you provide directly to us:</Text>

        <Text style={styles.subSectionTitle}>Personal Information:</Text>
        <Text style={styles.listItem}>• Name, email address, and mobile number</Text>
        <Text style={styles.listItem}>• Date of birth</Text>
        <Text style={styles.listItem}>• KYC documents (PAN, Aadhaar)</Text>
        <Text style={styles.listItem}>• Bank account information</Text>
        <Text style={styles.listItem}>• Profile photo</Text>

        <Text style={styles.subSectionTitle}>Financial Information:</Text>
        <Text style={styles.listItem}>• Transaction history</Text>
        <Text style={styles.listItem}>• Savings and investment data</Text>
        <Text style={styles.listItem}>• Payment methods</Text>
        <Text style={styles.listItem}>• Account balances</Text>

        <Text style={styles.subSectionTitle}>Technical Information:</Text>
        <Text style={styles.listItem}>• Device information and identifiers</Text>
        <Text style={styles.listItem}>• IP address and location data</Text>
        <Text style={styles.listItem}>• App usage data and analytics</Text>
        <Text style={styles.listItem}>• Log files and crash reports</Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>We use your information to:</Text>
        <Text style={styles.listItem}>• Provide and maintain our services</Text>
        <Text style={styles.listItem}>• Process transactions and payments</Text>
        <Text style={styles.listItem}>• Verify your identity (KYC)</Text>
        <Text style={styles.listItem}>• Send notifications and updates</Text>
        <Text style={styles.listItem}>• Improve our services</Text>
        <Text style={styles.listItem}>• Detect and prevent fraud</Text>
        <Text style={styles.listItem}>• Comply with legal obligations</Text>

        <Text style={styles.sectionTitle}>4. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement industry-standard security measures to protect your information:
        </Text>
        <Text style={styles.listItem}>• End-to-end encryption for sensitive data</Text>
        <Text style={styles.listItem}>• Secure Socket Layer (SSL) technology</Text>
        <Text style={styles.listItem}>• AES-256 encryption for stored data</Text>
        <Text style={styles.listItem}>• Regular security audits</Text>
        <Text style={styles.listItem}>• Biometric authentication support</Text>

        <Text style={styles.sectionTitle}>5. Data Sharing and Disclosure</Text>
        <Text style={styles.paragraph}>
          We may share your information with:
        </Text>
        <Text style={styles.listItem}>
          • Payment gateways (Razorpay, etc.) for processing payments
        </Text>
        <Text style={styles.listItem}>
          • KYC service providers for identity verification
        </Text>
        <Text style={styles.listItem}>
          • Investment partners (mutual fund houses)
        </Text>
        <Text style={styles.listItem}>
          • Government authorities when required by law
        </Text>
        <Text style={styles.listItem}>
          • Service providers who assist our operations
        </Text>

        <Text style={styles.paragraph}>
          We never sell your personal information to third parties.
        </Text>

        <Text style={styles.sectionTitle}>6. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your information for as long as necessary to provide our services and
          comply with legal obligations. Financial records are retained for 7 years as
          required by law.
        </Text>

        <Text style={styles.sectionTitle}>7. Your Rights</Text>
        <Text style={styles.paragraph}>You have the right to:</Text>
        <Text style={styles.listItem}>• Access your personal information</Text>
        <Text style={styles.listItem}>• Correct inaccurate information</Text>
        <Text style={styles.listItem}>• Request deletion of your data</Text>
        <Text style={styles.listItem}>• Object to processing of your data</Text>
        <Text style={styles.listItem}>• Export your data</Text>
        <Text style={styles.listItem}>• Withdraw consent</Text>

        <Text style={styles.sectionTitle}>8. Cookies and Tracking</Text>
        <Text style={styles.paragraph}>
          We use cookies and similar tracking technologies to track activity and improve
          user experience. You can control cookies through your device settings.
        </Text>

        <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our services are not intended for users under 18 years of age. We do not
          knowingly collect information from children.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy from time to time. We will notify you of any
          changes by posting the new policy and updating the "Last Updated" date.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Us</Text>
        <Text style={styles.paragraph}>
          For questions about this Privacy Policy or to exercise your rights:
          {'\n'}Email: privacy@saveinvest.app
          {'\n'}Phone: +91-XXXXXXXXXX
          {'\n'}Address: [Company Address]
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using SaveInvest, you consent to the collection and use of information in
            accordance with this Privacy Policy.
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
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
