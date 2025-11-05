import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { Text, List, Divider } from 'react-native-paper';
import { spacing, typography } from '@/theme/theme';

export default function AboutScreen() {
  const appVersion = '1.0.0';
  const buildNumber = '1';

  const handleOpenUrl = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.appName}>SaveInvest</Text>
        <Text style={styles.version}>Version {appVersion} (Build {buildNumber})</Text>
        <Text style={styles.tagline}>Save Smart, Invest Smarter</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About SaveInvest</Text>
        <Text style={styles.description}>
          SaveInvest is an automated savings and investment platform that helps you save
          money from every UPI transaction and invest it smartly in various financial
          instruments.
        </Text>
        <Text style={styles.description}>
          Our mission is to make saving and investing accessible, automatic, and rewarding
          for everyone.
        </Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <List.Item
          title="Auto-Save on Payments"
          description="Save a percentage of every transaction automatically"
          left={(props) => <List.Icon {...props} icon="cash-check" />}
        />
        <List.Item
          title="Smart Investments"
          description="Invest in mutual funds with one tap"
          left={(props) => <List.Icon {...props} icon="chart-line" />}
        />
        <List.Item
          title="Savings Goals"
          description="Track progress towards your financial goals"
          left={(props) => <List.Icon {...props} icon="target" />}
        />
        <List.Item
          title="Secure & Safe"
          description="Bank-grade security and encryption"
          left={(props) => <List.Icon {...props} icon="shield-check" />}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        <List.Item
          title="Terms of Service"
          left={(props) => <List.Icon {...props} icon="file-document" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => handleOpenUrl('https://saveinvest.app/terms')}
        />
        <List.Item
          title="Privacy Policy"
          left={(props) => <List.Icon {...props} icon="shield-account" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => handleOpenUrl('https://saveinvest.app/privacy')}
        />
        <List.Item
          title="Licenses"
          left={(props) => <List.Icon {...props} icon="certificate" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => handleOpenUrl('https://saveinvest.app/licenses')}
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connect With Us</Text>
        <List.Item
          title="Website"
          description="https://saveinvest.app"
          left={(props) => <List.Icon {...props} icon="web" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => handleOpenUrl('https://saveinvest.app')}
        />
        <List.Item
          title="Email"
          description="support@saveinvest.app"
          left={(props) => <List.Icon {...props} icon="email" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Linking.openURL('mailto:support@saveinvest.app')}
        />
        <List.Item
          title="Twitter"
          description="@SaveInvestApp"
          left={(props) => <List.Icon {...props} icon="twitter" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => handleOpenUrl('https://twitter.com/SaveInvestApp')}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.copyright}>
          © 2025 SaveInvest. All rights reserved.
        </Text>
        <Text style={styles.footerText}>Made with 💚 in India</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  appName: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight as any,
    marginBottom: spacing.xs,
    color: '#4CAF50',
  },
  version: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  divider: {
    marginVertical: spacing.md,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  footer: {
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.xl * 2,
  },
  copyright: {
    fontSize: 12,
    color: '#999',
    marginBottom: spacing.xs,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
