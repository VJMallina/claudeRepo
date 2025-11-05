import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Switch, Divider } from 'react-native-paper';
import { spacing, typography } from '@/theme/theme';

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState({
    pushEnabled: true,
    smsEnabled: true,
    emailEnabled: true,
    transactionAlerts: true,
    savingsAlerts: true,
    investmentAlerts: true,
    securityAlerts: true,
    goalAlerts: true,
    promotionalAlerts: false,
    dailySummary: true,
    weeklySummary: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingItem = ({
    title,
    subtitle,
    settingKey,
  }: {
    title: string;
    subtitle: string;
    settingKey: keyof typeof settings;
  }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => toggleSetting(settingKey)}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Channels</Text>
        <SettingItem
          title="Push Notifications"
          subtitle="Receive notifications in the app"
          settingKey="pushEnabled"
        />
        <SettingItem
          title="SMS Alerts"
          subtitle="Receive text messages"
          settingKey="smsEnabled"
        />
        <SettingItem
          title="Email Notifications"
          subtitle="Receive email updates"
          settingKey="emailEnabled"
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Types</Text>
        <SettingItem
          title="Transaction Alerts"
          subtitle="Payment success/failure notifications"
          settingKey="transactionAlerts"
        />
        <SettingItem
          title="Savings Alerts"
          subtitle="Auto-save and savings milestones"
          settingKey="savingsAlerts"
        />
        <SettingItem
          title="Investment Alerts"
          subtitle="Investment updates and NAV changes"
          settingKey="investmentAlerts"
        />
        <SettingItem
          title="Security Alerts"
          subtitle="Login and security updates"
          settingKey="securityAlerts"
        />
        <SettingItem
          title="Goal Alerts"
          subtitle="Savings goal progress updates"
          settingKey="goalAlerts"
        />
        <SettingItem
          title="Promotional Alerts"
          subtitle="Special offers and features"
          settingKey="promotionalAlerts"
        />
      </View>

      <Divider style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summaries</Text>
        <SettingItem
          title="Daily Summary"
          subtitle="Daily transaction and savings summary"
          settingKey="dailySummary"
        />
        <SettingItem
          title="Weekly Summary"
          subtitle="Weekly financial overview"
          settingKey="weeklySummary"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  settingText: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs,
    color: '#333',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    marginVertical: spacing.sm,
  },
});
