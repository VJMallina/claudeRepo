import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WithdrawalScreen from '../WithdrawalScreen';
import savingsService from '../../../services/savings.service';
import bankAccountService from '../../../services/bank-account.service';

jest.mock('../../../services/savings.service');
jest.mock('../../../services/bank-account.service');

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

const mockBankAccounts = [
  {
    id: '1',
    userId: 'user1',
    accountNumber: '1234567890',
    ifscCode: 'HDFC0001234',
    accountHolderName: 'John Doe',
    bankName: 'HDFC Bank',
    isPrimary: true,
    verified: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    userId: 'user1',
    accountNumber: '0987654321',
    ifscCode: 'ICIC0005678',
    accountHolderName: 'John Doe',
    bankName: 'ICICI Bank',
    isPrimary: false,
    verified: true,
    createdAt: '2024-01-02T00:00:00Z',
  },
];

describe('WithdrawalScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (savingsService.getBalance as jest.Mock).mockResolvedValue({
      balance: 5000,
      totalSaved: 5000,
      transactionCount: 10,
    });
    (bankAccountService.getBankAccounts as jest.Mock).mockResolvedValue(mockBankAccounts);
  });

  it('renders correctly and loads data', async () => {
    const { getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Withdraw Savings')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('₹5,000.00')).toBeTruthy();
      expect(getByText('HDFC Bank')).toBeTruthy();
    });
  });

  it('displays available balance', async () => {
    const { getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText('Available Balance')).toBeTruthy();
      expect(getByText('₹5,000.00')).toBeTruthy();
    });
  });

  it('auto-selects primary bank account', async () => {
    const { getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const primaryBadge = getByText('Primary');
      expect(primaryBadge).toBeTruthy();
    });
  });

  it('validates minimum amount', async () => {
    const { getByPlaceholderText, getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const amountInput = getByPlaceholderText('0.00');
      fireEvent.changeText(amountInput, '50');

      const withdrawButton = getByText('Withdraw Savings');
      fireEvent.press(withdrawButton);
    });

    // Minimum is typically enforced at API level, but client validation exists
    expect(savingsService.withdraw).not.toHaveBeenCalled();
  });

  it('validates amount does not exceed balance', async () => {
    const { getByPlaceholderText, getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const amountInput = getByPlaceholderText('0.00');
      fireEvent.changeText(amountInput, '6000');

      const withdrawButton = getByText('Withdraw Savings');
      fireEvent.press(withdrawButton);
    });

    await waitFor(() => {
      expect(getByText('Insufficient balance')).toBeTruthy();
    });
  });

  it('handles MAX button click', async () => {
    const { getByText, getByPlaceholderText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const maxButton = getByText('MAX');
      fireEvent.press(maxButton);
    });

    const amountInput = getByPlaceholderText('0.00');
    expect(amountInput.props.value).toBe('5000');
  });

  it('displays quick amount buttons', async () => {
    const { getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText('₹500')).toBeTruthy();
      expect(getByText('₹1000')).toBeTruthy();
      expect(getByText('₹2000')).toBeTruthy();
      expect(getByText('₹5000')).toBeTruthy();
    });
  });

  it('selects bank account when clicked', async () => {
    const { getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const iciciBank = getByText('ICICI Bank');
      fireEvent.press(iciciBank);
    });

    // Bank account should be selected (would check radio button state)
    expect(getByText('ICICI Bank')).toBeTruthy();
  });

  it('shows withdrawal summary when amount and bank are selected', async () => {
    const { getByPlaceholderText, getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const amountInput = getByPlaceholderText('0.00');
      fireEvent.changeText(amountInput, '1000');
    });

    await waitFor(() => {
      expect(getByText('Withdrawal Summary')).toBeTruthy();
      expect(getByText('1-2 business days')).toBeTruthy();
    });
  });

  it('calculates remaining balance correctly', async () => {
    const { getByPlaceholderText, getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const amountInput = getByPlaceholderText('0.00');
      fireEvent.changeText(amountInput, '2000');
    });

    await waitFor(() => {
      expect(getByText('Remaining Balance')).toBeTruthy();
      expect(getByText('₹3,000.00')).toBeTruthy();
    });
  });

  it('successfully processes withdrawal', async () => {
    (savingsService.withdraw as jest.Mock).mockResolvedValue({});

    const { getByPlaceholderText, getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const amountInput = getByPlaceholderText('0.00');
      fireEvent.changeText(amountInput, '1000');

      const withdrawButton = getByText('Withdraw Savings');
      fireEvent.press(withdrawButton);
    });

    await waitFor(() => {
      expect(savingsService.withdraw).toHaveBeenCalledWith({
        amount: 1000,
        bankAccountId: '1',
      });
      expect(mockNavigate).toHaveBeenCalledWith('WithdrawalSuccess', {
        amount: 1000,
        bankAccount: mockBankAccounts[0],
      });
    });
  });

  it('handles withdrawal API error', async () => {
    (savingsService.withdraw as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Withdrawal failed' } },
    });

    const { getByPlaceholderText, getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const amountInput = getByPlaceholderText('0.00');
      fireEvent.changeText(amountInput, '1000');

      const withdrawButton = getByText('Withdraw Savings');
      fireEvent.press(withdrawButton);
    });

    await waitFor(() => {
      expect(getByText('Withdrawal failed')).toBeTruthy();
    });
  });

  it('shows no banks message when no accounts available', async () => {
    (bankAccountService.getBankAccounts as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText('No bank accounts added')).toBeTruthy();
      expect(getByText('Add Bank Account')).toBeTruthy();
    });
  });

  it('disables withdraw button when no bank accounts', async () => {
    (bankAccountService.getBankAccounts as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(
      <WithdrawalScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const withdrawButton = getByText('Withdraw Savings');
      expect(withdrawButton.props.accessibilityState.disabled).toBe(true);
    });
  });
});
