import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import InvestmentBlockedScreen from '../InvestmentBlockedScreen';
import { useAuthStore } from '../../../store/authStore';
import onboardingService from '../../../services/onboarding.service';

// Mock dependencies
jest.mock('../../../store/authStore');
jest.mock('../../../services/onboarding.service');

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
};

const mockRoute = {
  params: {},
};

describe('InvestmentBlockedScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useAuthStore
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        mobile: '9876543210',
        kycLevel: 0,
      },
    });
  });

  it('renders loading state initially', () => {
    (onboardingService.getStatus as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders correctly with KYC level 0', async () => {
    (onboardingService.getStatus as jest.Mock).mockResolvedValue({
      currentStep: 'PAN_VERIFICATION',
      completionPercentage: 0,
      kycLevel: 0,
      permissions: {
        canMakePayments: true,
        maxPaymentAmount: 10000,
        canInvest: false,
        canWithdraw: false,
      },
    });

    const { getByText, findByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Complete Your KYC')).toBeTruthy();
    });

    expect(getByText('Investment features require Level 2 KYC verification')).toBeTruthy();
    expect(await findByText('0/4 Steps')).toBeTruthy();
  });

  it('renders correctly with KYC level 1', async () => {
    (onboardingService.getStatus as jest.Mock).mockResolvedValue({
      currentStep: 'AADHAAR_VERIFICATION',
      completionPercentage: 25,
      kycLevel: 1,
      permissions: {
        canMakePayments: true,
        maxPaymentAmount: null,
        canInvest: false,
        canWithdraw: false,
      },
    });

    const { getByText, findByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Complete Your KYC')).toBeTruthy();
    });

    expect(await findByText('1/4 Steps')).toBeTruthy();
    expect(getByText('25% complete')).toBeTruthy();
  });

  it('displays all KYC steps', async () => {
    (onboardingService.getStatus as jest.Mock).mockResolvedValue({
      currentStep: 'PAN_VERIFICATION',
      completionPercentage: 0,
      kycLevel: 0,
      permissions: {
        canMakePayments: true,
        maxPaymentAmount: 10000,
        canInvest: false,
        canWithdraw: false,
      },
    });

    const { getByText, findByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Complete Your KYC')).toBeTruthy();
    });

    expect(getByText('PAN Verification')).toBeTruthy();
    expect(getByText('Verify your PAN card details')).toBeTruthy();
    expect(getByText('Aadhaar Verification')).toBeTruthy();
    expect(getByText('Verify your Aadhaar via OTP')).toBeTruthy();
    expect(getByText('Liveness Check')).toBeTruthy();
    expect(getByText('Take a quick selfie for verification')).toBeTruthy();
    expect(getByText('Bank Account')).toBeTruthy();
    expect(getByText('Add your bank account for withdrawals')).toBeTruthy();
  });

  it('displays investment benefits', async () => {
    (onboardingService.getStatus as jest.Mock).mockResolvedValue({
      currentStep: 'PAN_VERIFICATION',
      completionPercentage: 0,
      kycLevel: 0,
      permissions: {
        canMakePayments: true,
        maxPaymentAmount: 10000,
        canInvest: false,
        canWithdraw: false,
      },
    });

    const { getByText, findByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText('What You\'ll Unlock')).toBeTruthy();
    });

    expect(getByText('Invest in mutual funds')).toBeTruthy();
    expect(getByText('Withdraw your savings to bank')).toBeTruthy();
    expect(getByText('Track your investment portfolio')).toBeTruthy();
    expect(getByText('Full account features')).toBeTruthy();
  });

  it('displays SEBI compliance note', async () => {
    (onboardingService.getStatus as jest.Mock).mockResolvedValue({
      currentStep: 'PAN_VERIFICATION',
      completionPercentage: 0,
      kycLevel: 0,
      permissions: {
        canMakePayments: true,
        maxPaymentAmount: 10000,
        canInvest: false,
        canWithdraw: false,
      },
    });

    const { getByText, findByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText(/As per SEBI guidelines/)).toBeTruthy();
    });
  });

  it('navigates to PAN verification when starting KYC from level 0', async () => {
    (onboardingService.getStatus as jest.Mock).mockResolvedValue({
      currentStep: 'PAN_VERIFICATION',
      completionPercentage: 0,
      kycLevel: 0,
      permissions: {
        canMakePayments: true,
        maxPaymentAmount: 10000,
        canInvest: false,
        canWithdraw: false,
      },
    });

    const { getByText, findByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Start KYC')).toBeTruthy();
    });

    const startButton = getByText('Start KYC');
    fireEvent.press(startButton);

    expect(mockNavigate).toHaveBeenCalledWith('PanVerification');
  });

  it('navigates to Aadhaar verification when continuing from level 1', async () => {
    (onboardingService.getStatus as jest.Mock).mockResolvedValue({
      currentStep: 'AADHAAR_VERIFICATION',
      completionPercentage: 25,
      kycLevel: 1,
      permissions: {
        canMakePayments: true,
        maxPaymentAmount: null,
        canInvest: false,
        canWithdraw: false,
      },
    });

    const { getByText, findByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Continue KYC')).toBeTruthy();
    });

    const continueButton = getByText('Continue KYC');
    fireEvent.press(continueButton);

    expect(mockNavigate).toHaveBeenCalledWith('AadhaarVerification');
  });

  it('goes back when secondary button is pressed', async () => {
    (onboardingService.getStatus as jest.Mock).mockResolvedValue({
      currentStep: 'PAN_VERIFICATION',
      completionPercentage: 0,
      kycLevel: 0,
      permissions: {
        canMakePayments: true,
        maxPaymentAmount: 10000,
        canInvest: false,
        canWithdraw: false,
      },
    });

    const { getByText, findByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Go Back')).toBeTruthy();
    });

    const backButton = getByText('Go Back');
    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });

  it('marks completed steps correctly', async () => {
    (onboardingService.getStatus as jest.Mock).mockResolvedValue({
      currentStep: 'LIVENESS_CHECK',
      completionPercentage: 50,
      kycLevel: 1,
      permissions: {
        canMakePayments: true,
        maxPaymentAmount: null,
        canInvest: false,
        canWithdraw: false,
      },
    });

    const { getByText, findAllByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Complete Your KYC')).toBeTruthy();
    });

    const completedBadges = await findAllByText('Completed');
    expect(completedBadges.length).toBeGreaterThan(0);
  });

  it('highlights next step correctly', async () => {
    (onboardingService.getStatus as jest.Mock).mockResolvedValue({
      currentStep: 'AADHAAR_VERIFICATION',
      completionPercentage: 25,
      kycLevel: 1,
      permissions: {
        canMakePayments: true,
        maxPaymentAmount: null,
        canInvest: false,
        canWithdraw: false,
      },
    });

    const { getByText, findByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Complete Your KYC')).toBeTruthy();
    });

    expect(await findByText('Next Step')).toBeTruthy();
  });

  it('handles API error gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    (onboardingService.getStatus as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { queryByText } = render(
      <InvestmentBlockedScreen
        navigation={mockNavigation as any}
        route={mockRoute as any}
      />
    );

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to load onboarding status:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });
});
