import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigator';
import { useAuthStore } from '@/store/authStore';
import apiService from '@/services/api.service';
import { spacing, typography } from '@/theme/theme';

type ProfileSetupScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ProfileSetup'>;
};

export default function ProfileSetupScreen({ navigation }: ProfileSetupScreenProps) {
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    // Validate
    const newErrors = { name: '', email: '' };
    let hasError = false;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      hasError = true;
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      hasError = true;
    }

    if (email && !validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    try {
      setIsLoading(true);

      // Update profile
      const response = await apiService.patch('/users/profile', {
        name: name.trim(),
        email: email.trim() || null,
      });

      // Update user in store
      setUser(response);

      // Navigate to PAN verification
      navigation.navigate('PanVerification');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update profile';
      setErrors({ ...errors, name: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow skip if name is already set
    if (user?.name) {
      navigation.navigate('PanVerification');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>👤</Text>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Help us personalize your experience
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Full Name *"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setErrors({ ...errors, name: '' });
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.name}
            disabled={isLoading}
            autoCapitalize="words"
            autoComplete="name"
          />
          {errors.name && (
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>
          )}

          <TextInput
            label="Email Address (Optional)"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: '' });
            }}
            mode="outlined"
            style={styles.input}
            error={!!errors.email}
            disabled={isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          {errors.email && (
            <HelperText type="error" visible={!!errors.email}>
              {errors.email}
            </HelperText>
          )}

          <Text style={styles.note}>
            * Required fields
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleContinue}
            loading={isLoading}
            disabled={isLoading || !name.trim()}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Continue
          </Button>

          {user?.name && (
            <Button
              mode="text"
              onPress={handleSkip}
              disabled={isLoading}
              style={styles.skipButton}
            >
              Skip for now
            </Button>
          )}
        </View>

        <View style={styles.progress}>
          <Text style={styles.progressText}>Step 1 of 5</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '20%' }]} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: '#666666',
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.xs,
  },
  note: {
    ...typography.caption,
    color: '#666666',
    marginTop: spacing.md,
  },
  actions: {
    marginBottom: spacing.xl,
  },
  button: {
    marginBottom: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.sm,
  },
  skipButton: {
    alignSelf: 'center',
  },
  progress: {
    marginTop: 'auto',
  },
  progressText: {
    ...typography.caption,
    color: '#666666',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200EE',
  },
});
