import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, TextInput, HelperText, Avatar } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { spacing, typography } from '../../theme/theme';
import { useAuthStore } from '../../store/authStore';
import { UpdateProfileRequest } from '../../types/api.types';
import authService from '../../services/auth.service';

type RootStackParamList = {
  ProfileSettings: undefined;
};

type ProfileSettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'ProfileSettings'>;

export default function ProfileSettingsScreen({ navigation }: ProfileSettingsScreenProps) {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    // Basic validation
    if (name && name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (email && !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const updates: UpdateProfileRequest = {};
      if (name && name !== user?.name) updates.name = name;
      if (email && email !== user?.email) updates.email = email;
      if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
      if (address) updates.address = address;
      if (city) updates.city = city;
      if (state) updates.state = state;
      if (pincode) updates.pincode = pincode;

      const updatedUser = await authService.updateProfile(updates);
      updateUser(updatedUser);
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    }
    return user?.mobile.substring(0, 2) || 'U';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar.Text size={80} label={getInitials()} style={styles.avatar} />
        <Text style={styles.mobile}>{user?.mobile}</Text>
        <Text style={styles.kycLevel}>KYC Level {user?.kycLevel}</Text>
      </View>

      {/* Basic Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            label="Date of Birth"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            mode="outlined"
            placeholder="DD/MM/YYYY"
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* Address */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Address</Text>

          <TextInput
            label="Address"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <TextInput
            label="City"
            value={city}
            onChangeText={setCity}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="State"
            value={state}
            onChangeText={setState}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Pincode"
            value={pincode}
            onChangeText={setPincode}
            mode="outlined"
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      {/* Success/Error Messages */}
      {success && (
        <Card style={styles.successCard}>
          <Card.Content>
            <Text style={styles.successText}>Profile updated successfully!</Text>
          </Card.Content>
        </Card>
      )}

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>{error}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Save Button */}
      <Button
        mode="contained"
        onPress={handleSave}
        loading={submitting}
        disabled={submitting}
        style={styles.saveButton}
        contentStyle={styles.buttonContent}
      >
        Save Changes
      </Button>
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
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    backgroundColor: '#6200EE',
    marginBottom: spacing.md,
  },
  mobile: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: spacing.xs,
  },
  kycLevel: {
    fontSize: 14,
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
  input: {
    backgroundColor: '#FFF',
    marginBottom: spacing.md,
  },
  successCard: {
    backgroundColor: '#E8F5E9',
    marginBottom: spacing.lg,
  },
  successText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    marginBottom: spacing.lg,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 8,
  },
  buttonContent: {
    height: 48,
  },
});
