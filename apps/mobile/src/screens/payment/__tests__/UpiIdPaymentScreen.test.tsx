import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import UpiIdPaymentScreen from '../UpiIdPaymentScreen';

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

describe('UpiIdPaymentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all elements', () => {
    const { getByText, getByPlaceholderText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Enter UPI Details')).toBeTruthy();
    expect(getByText('Enter the merchant\'s UPI ID to make a payment')).toBeTruthy();
    expect(getByPlaceholderText('username@paytm')).toBeTruthy();
  });

  it('displays QR code alternative option', () => {
    const { getByText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Or scan a QR code instead')).toBeTruthy();
    expect(getByText('Scan QR')).toBeTruthy();
  });

  it('validates UPI ID format', () => {
    const { getByPlaceholderText, getByText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const upiInput = getByPlaceholderText('username@paytm');
    const continueButton = getByText('Continue');

    fireEvent.changeText(upiInput, 'invalidupi');
    fireEvent.press(continueButton);

    waitFor(() => {
      expect(getByText(/Invalid UPI ID format/)).toBeTruthy();
    });
  });

  it('validates merchant name is required', () => {
    const { getByPlaceholderText, getByText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const upiInput = getByPlaceholderText('username@paytm');
    const continueButton = getByText('Continue');

    fireEvent.changeText(upiInput, 'user@paytm');
    fireEvent.press(continueButton);

    waitFor(() => {
      expect(getByText(/Merchant name is required/)).toBeTruthy();
    });
  });

  it('accepts valid UPI ID format', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const upiInput = getByPlaceholderText('username@paytm');
    const merchantInput = getByPlaceholderText('Enter merchant or receiver name');
    const continueButton = getByText('Continue');

    fireEvent.changeText(upiInput, 'merchant@paytm');
    fireEvent.changeText(merchantInput, 'Test Merchant');
    fireEvent.press(continueButton);

    expect(mockNavigate).toHaveBeenCalledWith('PaymentConfirmation', {
      merchantUpiId: 'merchant@paytm',
      merchantName: 'Test Merchant',
      amount: null,
    });
  });

  it('handles amount input correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, '500.50');

    const upiInput = getByPlaceholderText('username@paytm');
    const merchantInput = getByPlaceholderText('Enter merchant or receiver name');
    const continueButton = getByText('Continue');

    fireEvent.changeText(upiInput, 'merchant@paytm');
    fireEvent.changeText(merchantInput, 'Test Merchant');
    fireEvent.press(continueButton);

    expect(mockNavigate).toHaveBeenCalledWith('PaymentConfirmation', {
      merchantUpiId: 'merchant@paytm',
      merchantName: 'Test Merchant',
      amount: 500.50,
    });
  });

  it('displays popular UPI handles', () => {
    const { getByText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('@paytm')).toBeTruthy();
    expect(getByText('@phonepe')).toBeTruthy();
    expect(getByText('@googlepay')).toBeTruthy();
  });

  it('adds handle when quick add button is pressed', () => {
    const { getByText, getByPlaceholderText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const upiInput = getByPlaceholderText('username@paytm');
    fireEvent.changeText(upiInput, '9876543210');

    const paytmButton = getByText('@paytm');
    fireEvent.press(paytmButton);

    expect(upiInput.props.value).toContain('@paytm');
  });

  it('navigates to QR scanner when scan QR is pressed', () => {
    const { getByText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const scanButton = getByText('Scan QR');
    fireEvent.press(scanButton);

    expect(mockNavigate).toHaveBeenCalledWith('QRScanner');
  });

  it('converts UPI ID to lowercase', () => {
    const { getByPlaceholderText, getByText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const upiInput = getByPlaceholderText('username@paytm');
    const merchantInput = getByPlaceholderText('Enter merchant or receiver name');
    const continueButton = getByText('Continue');

    fireEvent.changeText(upiInput, 'MERCHANT@PAYTM');
    fireEvent.changeText(merchantInput, 'Test Merchant');
    fireEvent.press(continueButton);

    expect(mockNavigate).toHaveBeenCalledWith('PaymentConfirmation', {
      merchantUpiId: 'merchant@paytm',
      merchantName: 'Test Merchant',
      amount: null,
    });
  });

  it('sanitizes amount input to only allow numbers and decimal', () => {
    const { getByPlaceholderText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, 'abc123.45def');

    expect(amountInput.props.value).toBe('123.45');
  });

  it('displays payment flow info', () => {
    const { getByText } = render(
      <UpiIdPaymentScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Payment Flow')).toBeTruthy();
    expect(getByText(/Enter UPI ID and merchant name/)).toBeTruthy();
    expect(getByText(/Review payment details/)).toBeTruthy();
    expect(getByText(/Complete payment via your UPI app/)).toBeTruthy();
  });
});
