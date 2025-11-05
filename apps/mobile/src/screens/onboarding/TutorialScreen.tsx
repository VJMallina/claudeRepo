import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomButton } from '@/components';
import { spacing, typography } from '@/theme/theme';

const { width } = Dimensions.get('window');

type TutorialScreenProps = {
  navigation: NativeStackNavigationProp<any, 'Tutorial'>;
};

const tutorialSlides = [
  {
    id: '1',
    icon: '💸',
    title: 'Automatic Savings',
    description:
      'Save a percentage of every UPI payment automatically. Set it once and watch your savings grow!',
  },
  {
    id: '2',
    icon: '📊',
    title: 'Smart Investments',
    description:
      'Invest your saved money in mutual funds with just one tap. No complicated processes!',
  },
  {
    id: '3',
    icon: '🎯',
    title: 'Track Your Goals',
    description:
      'Set financial goals and track your progress. Achieve your dreams one step at a time!',
  },
  {
    id: '4',
    icon: '🔒',
    title: 'Safe & Secure',
    description:
      'Bank-grade encryption and biometric authentication keep your money and data safe.',
  },
];

export default function TutorialScreen({ navigation }: TutorialScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / width
    );
    setCurrentIndex(slideIndex);
  };

  const handleNext = () => {
    if (currentIndex < tutorialSlides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = () => {
    navigation.replace('ProfileSetup' as any);
  };

  const renderSlide = ({ item }: { item: typeof tutorialSlides[0] }) => (
    <View style={styles.slide}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <CustomButton mode="text" onPress={handleSkip}>
          Skip
        </CustomButton>
      </View>

      <FlatList
        ref={flatListRef}
        data={tutorialSlides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        keyExtractor={(item) => item.id}
        scrollEventThrottle={16}
      />

      <View style={styles.pagination}>
        {tutorialSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <CustomButton
          mode="contained"
          onPress={handleNext}
          style={styles.button}
        >
          {currentIndex === tutorialSlides.length - 1
            ? 'Get Started'
            : 'Next'}
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 100,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight as any,
    marginBottom: spacing.md,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: typography.body.fontSize,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#4CAF50',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    width: '100%',
  },
});
