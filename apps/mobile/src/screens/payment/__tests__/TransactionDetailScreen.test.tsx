import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TransactionDetailScreen from '../TransactionDetailScreen';
import transactionService from '../../../services/transaction.service';
import { Share } from 'react-native';

jest.mock('../../../services/transaction.service');
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

const mockTransaction = {
  id: 'txn123',
  type: 'PAYMENT' as const,
  amount: 500,
  description: 'Payment to Test Merchant',
  status: 'SUCCESS' as const,
  createdAt: '2024-01-15T10:00:00Z',
  merchantName: 'Test Merchant',
  upiTransactionId: 'UPI123456789',
  savingsAmount: 50,
};

describe('TransactionDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (transactionService.getTransactionById as jest.Mock).mockResolvedValue(mockTransaction);
  });

  it('renders correctly and loads transaction', async () => {
    const { getByText } = render(
      <TransactionDetailScreen
        navigation={mockNavigation as any}
        route={{ params: { transactionId: 'txn123' } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Transaction Successful')).toBeTruthy();
      expect(getByText('Payment to Test Merchant')).toBeTruthy();
    });
  });

  it('displays transaction amount correctly', async () => {
    const { getByText } = render(
      <TransactionDetailScreen
        navigation={mockNavigation as any}
        route={{ params: { transactionId: 'txn123' } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText(/-₹500.00/)).toBeTruthy();
    });
  });

  it('shows all transaction details', async () => {
    const { getByText } = render(
      <TransactionDetailScreen
        navigation={mockNavigation as any}
        route={{ params: { transactionId: 'txn123' } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Transaction Details')).toBeTruthy();
      expect(getByText('Test Merchant')).toBeTruthy();
      expect(getByText('UPI123456789')).toBeTruthy();
      expect(getByText('SUCCESS')).toBeTruthy();
    });
  });

  it('displays savings amount when available', async () => {
    const { getByText } = render(
      <TransactionDetailScreen
        navigation={mockNavigation as any}
        route={{ params: { transactionId: 'txn123' } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Savings Amount')).toBeTruthy();
      expect(getByText(/\+₹50.00/)).toBeTruthy();
    });
  });

  it('shows download receipt button for successful transactions', async () => {
    const { getByText } = render(
      <TransactionDetailScreen
        navigation={mockNavigation as any}
        route={{ params: { transactionId: 'txn123' } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Download Receipt')).toBeTruthy();
      expect(getByText('Share Receipt')).toBeTruthy();
    });
  });

  it('does not show receipt buttons for failed transactions', async () => {
    (transactionService.getTransactionById as jest.Mock).mockResolvedValue({
      ...mockTransaction,
      status: 'FAILED',
    });

    const { queryByText } = render(
      <TransactionDetailScreen
        navigation={mockNavigation as any}
        route={{ params: { transactionId: 'txn123' } } as any}
      />
    );

    await waitFor(() => {
      expect(queryByText('Download Receipt')).toBeNull();
    });
  });

  it('handles download receipt', async () => {
    (transactionService.downloadReceipt as jest.Mock).mockResolvedValue({
      url: 'https://example.com/receipt.pdf',
      fileName: 'receipt.pdf',
    });

    const { getByText } = render(
      <TransactionDetailScreen
        navigation={mockNavigation as any}
        route={{ params: { transactionId: 'txn123' } } as any}
      />
    );

    await waitFor(() => {
      const downloadButton = getByText('Download Receipt');
      fireEvent.press(downloadButton);
    });

    await waitFor(() => {
      expect(transactionService.downloadReceipt).toHaveBeenCalledWith('txn123');
      expect(mockNavigate).toHaveBeenCalledWith('TransactionReceipt', {
        transactionId: 'txn123',
      });
    });
  });

  it('handles share receipt', async () => {
    (transactionService.getReceiptData as jest.Mock).mockResolvedValue({
      data: 'base64data',
    });

    const { getByText } = render(
      <TransactionDetailScreen
        navigation={mockNavigation as any}
        route={{ params: { transactionId: 'txn123' } } as any}
      />
    );

    await waitFor(() => {
      const shareButton = getByText('Share Receipt');
      fireEvent.press(shareButton);
    });

    await waitFor(() => {
      expect(Share.share).toHaveBeenCalled();
    });
  });

  it('shows loading state', () => {
    (transactionService.getTransactionById as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    const { getByText } = render(
      <TransactionDetailScreen
        navigation={mockNavigation as any}
        route={{ params: { transactionId: 'txn123' } } as any}
      />
    );

    expect(getByText('Loading transaction...')).toBeTruthy();
  });

  it('shows error when transaction not found', async () => {
    (transactionService.getTransactionById as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(
      <TransactionDetailScreen
        navigation={mockNavigation as any}
        route={{ params: { transactionId: 'txn123' } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText('Transaction not found')).toBeTruthy();
    });
  });

  it('displays help card', async () => {
    const { getByText } = render(
      <TransactionDetailScreen
        navigation={mockNavigation as any}
        route={{ params: { transactionId: 'txn123' } } as any}
      />
    );

    await waitFor(() => {
      expect(getByText(/Need help with this transaction/)).toBeTruthy();
    });
  });
});
