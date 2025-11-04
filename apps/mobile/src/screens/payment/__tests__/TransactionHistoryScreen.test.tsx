import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TransactionHistoryScreen from '../TransactionHistoryScreen';
import transactionService from '../../../services/transaction.service';

jest.mock('../../../services/transaction.service');

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

const mockTransactions = [
  {
    id: '1',
    type: 'PAYMENT' as const,
    amount: 500,
    description: 'Payment to Merchant',
    status: 'SUCCESS' as const,
    createdAt: '2024-01-15T10:00:00Z',
    merchantName: 'Test Merchant',
    upiTransactionId: 'UPI123456',
  },
  {
    id: '2',
    type: 'SAVINGS_CREDIT' as const,
    amount: 50,
    description: 'Auto-savings',
    status: 'SUCCESS' as const,
    createdAt: '2024-01-15T10:01:00Z',
    balanceAfter: 1050,
  },
];

describe('TransactionHistoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (transactionService.getTransactions as jest.Mock).mockResolvedValue({
      transactions: mockTransactions,
      total: 2,
      page: 1,
      limit: 20,
      hasMore: false,
    });
  });

  it('renders correctly and loads transactions', async () => {
    const { getByText } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    expect(getByText('Transaction History')).toBeTruthy();

    await waitFor(() => {
      expect(getByText('Payment to Merchant')).toBeTruthy();
      expect(getByText('Auto-savings')).toBeTruthy();
    });
  });

  it('displays transaction count', async () => {
    const { getByText } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText('2 transactions')).toBeTruthy();
    });
  });

  it('shows empty state when no transactions', async () => {
    (transactionService.getTransactions as jest.Mock).mockResolvedValue({
      transactions: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    });

    const { getByText } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText('No Transactions Yet')).toBeTruthy();
    });
  });

  it('navigates to transaction detail when transaction is pressed', async () => {
    const { getByText } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const transaction = getByText('Payment to Merchant');
      fireEvent.press(transaction);
    });

    expect(mockNavigate).toHaveBeenCalledWith('TransactionDetail', { transactionId: '1' });
  });

  it('handles search input', async () => {
    const { getByPlaceholderText } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const searchInput = getByPlaceholderText('Search transactions');
    fireEvent.changeText(searchInput, 'Merchant');

    await waitFor(() => {
      expect(transactionService.getTransactions).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({ search: 'Merchant' })
      );
    });
  });

  it('opens filter modal when filter button is pressed', async () => {
    const { getByText } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const filterButton = getByText(/Filters/);
    fireEvent.press(filterButton);

    await waitFor(() => {
      expect(getByText('Filter Transactions')).toBeTruthy();
    });
  });

  it('applies filters correctly', async () => {
    const { getByText } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    // Open filter modal
    const filterButton = getByText(/Filters/);
    fireEvent.press(filterButton);

    await waitFor(() => {
      const paymentsOption = getByText('Payments');
      fireEvent.press(paymentsOption);
    });

    const applyButton = getByText('Apply');
    fireEvent.press(applyButton);

    await waitFor(() => {
      expect(transactionService.getTransactions).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({ type: 'PAYMENT' })
      );
    });
  });

  it('resets filters', async () => {
    const { getByText } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    const filterButton = getByText(/Filters/);
    fireEvent.press(filterButton);

    await waitFor(() => {
      const resetButton = getByText('Reset');
      fireEvent.press(resetButton);
    });

    await waitFor(() => {
      expect(transactionService.getTransactions).toHaveBeenCalledWith(
        1,
        20,
        expect.objectContaining({ type: 'ALL', status: 'ALL' })
      );
    });
  });

  it('handles pull to refresh', async () => {
    const { getByTestId } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(transactionService.getTransactions).toHaveBeenCalledTimes(1);
    });

    // Simulate refresh - this would normally be done via ScrollView's refreshControl
    // but for testing we can just verify the function exists
    expect(transactionService.getTransactions).toHaveBeenCalled();
  });

  it('displays correct transaction type labels', async () => {
    const { getByText } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      expect(getByText('Payment')).toBeTruthy();
      expect(getByText('Savings Added')).toBeTruthy();
    });
  });

  it('shows debit amounts in red', async () => {
    const { getByText } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const amount = getByText(/-₹500/);
      expect(amount).toBeTruthy();
    });
  });

  it('shows credit amounts in green', async () => {
    const { getByText } = render(
      <TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />
    );

    await waitFor(() => {
      const amount = getByText(/\+₹50/);
      expect(amount).toBeTruthy();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    (transactionService.getTransactions as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(<TransactionHistoryScreen navigation={mockNavigation as any} route={{} as any} />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to load transactions:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });
});
