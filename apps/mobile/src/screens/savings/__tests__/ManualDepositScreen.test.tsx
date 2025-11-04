import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ManualDepositScreen from '../ManualDepositScreen';
import savingsService from '../../../services/savings.service';

jest.mock('../../../services/savings.service');

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

describe('ManualDepositScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Add to Savings')).toBeTruthy();
    expect(getByText('Deposit money directly to your savings wallet')).toBeTruthy();
  });

  it('validates minimum amount', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, '50');

    const proceedButton = getByText('Proceed to Pay');
    fireEvent.press(proceedButton);

    await waitFor(() => {
      expect(getByText('Minimum deposit amount is ₹100')).toBeTruthy();
    });
  });

  it('validates maximum amount', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, '150000');

    const proceedButton = getByText('Proceed to Pay');
    fireEvent.press(proceedButton);

    await waitFor(() => {
      expect(getByText('Maximum deposit amount is ₹1,00,000')).toBeTruthy();
    });
  });

  it('displays quick amount buttons', () => {
    const { getByText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('₹100')).toBeTruthy();
    expect(getByText('₹500')).toBeTruthy();
    expect(getByText('₹1000')).toBeTruthy();
    expect(getByText('₹2000')).toBeTruthy();
    expect(getByText('₹5000')).toBeTruthy();
  });

  it('sets amount when quick button is pressed', () => {
    const { getByText, getByPlaceholderText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const quickButton = getByText('₹1000');
    fireEvent.press(quickButton);

    const amountInput = getByPlaceholderText('0.00');
    expect(amountInput.props.value).toBe('1000');
  });

  it('shows UPI payment method', () => {
    const { getByText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Payment Method')).toBeTruthy();
    expect(getByText('UPI Payment')).toBeTruthy();
  });

  it('displays benefits', () => {
    const { getByText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Why Add to Savings?')).toBeTruthy();
    expect(getByText('Build your emergency fund')).toBeTruthy();
    expect(getByText('Invest in mutual funds anytime')).toBeTruthy();
  });

  it('shows deposit summary when amount is entered', async () => {
    const { getByPlaceholderText, getByText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, '1000');

    await waitFor(() => {
      expect(getByText('Deposit Summary')).toBeTruthy();
      expect(getByText('₹1,000.00')).toBeTruthy();
      expect(getByText('FREE')).toBeTruthy();
    });
  });

  it('includes description in summary when provided', async () => {
    const { getByPlaceholderText, getByText, getByLabelText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, '1000');

    const descriptionInput = getByLabelText('Add a note');
    fireEvent.changeText(descriptionInput, 'Monthly savings');

    await waitFor(() => {
      expect(getByText('Monthly savings')).toBeTruthy();
    });
  });

  it('successfully processes deposit', async () => {
    (savingsService.deposit as jest.Mock).mockResolvedValue({
      transactionId: 'txn123',
    });

    const { getByPlaceholderText, getByText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, '1000');

    const proceedButton = getByText('Proceed to Pay');
    fireEvent.press(proceedButton);

    await waitFor(() => {
      expect(savingsService.deposit).toHaveBeenCalledWith({
        amount: 1000,
        description: 'Manual deposit to savings',
      });
      expect(mockNavigate).toHaveBeenCalledWith('DepositSuccess', {
        amount: 1000,
        transactionId: 'txn123',
      });
    });
  });

  it('uses custom description when provided', async () => {
    (savingsService.deposit as jest.Mock).mockResolvedValue({
      transactionId: 'txn123',
    });

    const { getByPlaceholderText, getByText, getByLabelText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, '1000');

    const descriptionInput = getByLabelText('Add a note');
    fireEvent.changeText(descriptionInput, 'Emergency fund');

    const proceedButton = getByText('Proceed to Pay');
    fireEvent.press(proceedButton);

    await waitFor(() => {
      expect(savingsService.deposit).toHaveBeenCalledWith({
        amount: 1000,
        description: 'Emergency fund',
      });
    });
  });

  it('handles deposit API error', async () => {
    (savingsService.deposit as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Deposit failed' } },
    });

    const { getByPlaceholderText, getByText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, '1000');

    const proceedButton = getByText('Proceed to Pay');
    fireEvent.press(proceedButton);

    await waitFor(() => {
      expect(getByText('Deposit failed')).toBeTruthy();
    });
  });

  it('sanitizes amount input', () => {
    const { getByPlaceholderText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const amountInput = getByPlaceholderText('0.00');
    fireEvent.changeText(amountInput, 'abc123.45def');

    expect(amountInput.props.value).toBe('123.45');
  });

  it('disables proceed button when amount is below minimum', () => {
    const { getByText } = render(
      <ManualDepositScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const proceedButton = getByText('Proceed to Pay');
    expect(proceedButton.props.accessibilityState.disabled).toBe(true);
  });
});
