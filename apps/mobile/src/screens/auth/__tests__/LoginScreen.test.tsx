import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../LoginScreen';
import authService from '@/services/auth.service';

jest.mock('@/services/auth.service');

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login screen', () => {
    const { getByText, getByPlaceholderText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );

    expect(getByText('SaveInvest')).toBeTruthy();
    expect(getByText('Get Started')).toBeTruthy();
    expect(getByText('Enter your mobile number to continue')).toBeTruthy();
  });

  it('should show validation error for invalid mobile number', async () => {
    const { getByText, getByTestId, findByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );

    const input = getByTestId('mobile-input');
    const sendOtpButton = getByText('Send OTP');

    fireEvent.changeText(input, '123'); // Invalid mobile
    fireEvent.press(sendOtpButton);

    const errorText = await findByText('Please enter a valid 10-digit mobile number');
    expect(errorText).toBeTruthy();
  });

  it('should call register API with valid mobile number', async () => {
    (authService.register as jest.Mock).mockResolvedValue({
      message: 'OTP sent successfully',
      userId: 'user-123',
    });

    const { getByTestId, getByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );

    const input = getByTestId('mobile-input');
    const sendOtpButton = getByText('Send OTP');

    fireEvent.changeText(input, '9876543210');
    fireEvent.press(sendOtpButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        mobile: '9876543210',
      });
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Otp', {
      mobile: '9876543210',
    });
  });

  it('should show error message if API call fails', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Mobile number already registered',
        },
      },
    };

    (authService.register as jest.Mock).mockRejectedValue(mockError);

    const { getByTestId, getByText, findByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );

    const input = getByTestId('mobile-input');
    const sendOtpButton = getByText('Send OTP');

    fireEvent.changeText(input, '9876543210');
    fireEvent.press(sendOtpButton);

    const errorText = await findByText('Mobile number already registered');
    expect(errorText).toBeTruthy();
  });

  it('should disable button while loading', async () => {
    let resolveRegister: any;
    const registerPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });

    (authService.register as jest.Mock).mockReturnValue(registerPromise);

    const { getByTestId, getByText } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );

    const input = getByTestId('mobile-input');
    const sendOtpButton = getByText('Send OTP');

    fireEvent.changeText(input, '9876543210');
    fireEvent.press(sendOtpButton);

    await waitFor(() => {
      expect(sendOtpButton.props.accessibilityState.disabled).toBe(true);
    });

    resolveRegister({ message: 'OTP sent', userId: 'user-123' });
  });

  it('should filter non-numeric characters from mobile input', () => {
    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );

    const input = getByTestId('mobile-input');

    fireEvent.changeText(input, 'abc123def456');

    expect(input.props.value).toBe('123456');
  });

  it('should limit mobile number to 10 digits', () => {
    const { getByTestId } = render(
      <LoginScreen navigation={mockNavigation as any} />
    );

    const input = getByTestId('mobile-input');

    fireEvent.changeText(input, '12345678901234');

    expect(input.props.value.length).toBeLessThanOrEqual(10);
  });
});
