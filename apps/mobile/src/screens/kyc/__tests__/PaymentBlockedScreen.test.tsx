import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PaymentBlockedScreen from '../PaymentBlockedScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
};

// Mock route
const mockRoute = {
  params: {
    attemptedAmount: 15000,
    merchantName: 'Test Merchant',
  },
};

describe('PaymentBlockedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all elements', () => {
    const { getByText } = render(
      <PaymentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(getByText('Payment Limit Reached')).toBeTruthy();
    expect(getByText('Complete PAN verification to unlock unlimited payments')).toBeTruthy();
    expect(getByText('₹15,000')).toBeTruthy();
    expect(getByText('Test Merchant')).toBeTruthy();
  });

  it('displays current limit information', () => {
    const { getByText } = render(
      <PaymentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(getByText('Current Limit')).toBeTruthy();
    expect(getByText('₹10,000 per payment')).toBeTruthy();
    expect(getByText('Without PAN verification')).toBeTruthy();
  });

  it('displays after verification benefits', () => {
    const { getByText } = render(
      <PaymentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(getByText('After PAN Verification')).toBeTruthy();
    expect(getByText('Unlimited Payments')).toBeTruthy();
    expect(getByText('Complete KYC Level 1')).toBeTruthy();
  });

  it('displays all benefits of PAN verification', () => {
    const { getByText } = render(
      <PaymentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(getByText('Benefits of PAN Verification')).toBeTruthy();
    expect(getByText('Unlimited payment amounts')).toBeTruthy();
    expect(getByText('Instant verification (under 30 seconds)')).toBeTruthy();
    expect(getByText('No document upload required')).toBeTruthy();
    expect(getByText('One-time verification')).toBeTruthy();
  });

  it('displays RBI compliance note', () => {
    const { getByText } = render(
      <PaymentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(getByText(/As per RBI guidelines/)).toBeTruthy();
  });

  it('navigates to PAN verification when primary button is pressed', () => {
    const { getByText } = render(
      <PaymentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    const verifyButton = getByText('Verify PAN Now');
    fireEvent.press(verifyButton);

    expect(mockNavigate).toHaveBeenCalledWith('PanVerification');
  });

  it('goes back when secondary button is pressed', () => {
    const { getByText } = render(
      <PaymentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    const backButton = getByText('Go Back');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('renders without merchant name when not provided', () => {
    const routeWithoutMerchant = {
      params: {
        attemptedAmount: 15000,
      },
    };

    const { queryByText } = render(
      <PaymentBlockedScreen
        navigation={mockNavigation as any}
        route={routeWithoutMerchant as any}
      />
    );

    expect(queryByText('Merchant:')).toBeNull();
  });

  it('formats large amounts correctly', () => {
    const routeWithLargeAmount = {
      params: {
        attemptedAmount: 1500000,
        merchantName: 'Test Merchant',
      },
    };

    const { getByText } = render(
      <PaymentBlockedScreen
        navigation={mockNavigation as any}
        route={routeWithLargeAmount as any}
      />
    );

    expect(getByText('₹15,00,000')).toBeTruthy();
  });
});
