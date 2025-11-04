import transactionService from '../transaction.service';
import apiService from '../api.service';

jest.mock('../api.service');

describe('TransactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('fetches transactions with default parameters', async () => {
      const mockResponse = {
        transactions: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await transactionService.getTransactions();

      expect(apiService.get).toHaveBeenCalledWith('/transactions?page=1&limit=20');
      expect(result).toEqual(mockResponse);
    });

    it('fetches transactions with custom page and limit', async () => {
      const mockResponse = {
        transactions: [],
        total: 0,
        page: 2,
        limit: 10,
        hasMore: true,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await transactionService.getTransactions(2, 10);

      expect(apiService.get).toHaveBeenCalledWith('/transactions?page=2&limit=10');
    });

    it('applies type filter', async () => {
      (apiService.get as jest.Mock).mockResolvedValue({});

      await transactionService.getTransactions(1, 20, { type: 'PAYMENT' });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining('type=PAYMENT')
      );
    });

    it('applies status filter', async () => {
      (apiService.get as jest.Mock).mockResolvedValue({});

      await transactionService.getTransactions(1, 20, { status: 'SUCCESS' });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining('status=SUCCESS')
      );
    });

    it('applies date filters', async () => {
      (apiService.get as jest.Mock).mockResolvedValue({});

      await transactionService.getTransactions(1, 20, {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-01-01')
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2024-01-31')
      );
    });

    it('applies search filter', async () => {
      (apiService.get as jest.Mock).mockResolvedValue({});

      await transactionService.getTransactions(1, 20, { search: 'merchant' });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining('search=merchant')
      );
    });

    it('does not include ALL type in query params', async () => {
      (apiService.get as jest.Mock).mockResolvedValue({});

      await transactionService.getTransactions(1, 20, { type: 'ALL' });

      const callArg = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callArg).not.toContain('type=ALL');
    });

    it('does not include ALL status in query params', async () => {
      (apiService.get as jest.Mock).mockResolvedValue({});

      await transactionService.getTransactions(1, 20, { status: 'ALL' });

      const callArg = (apiService.get as jest.Mock).mock.calls[0][0];
      expect(callArg).not.toContain('status=ALL');
    });
  });

  describe('getTransactionById', () => {
    it('fetches transaction by ID', async () => {
      const mockTransaction = {
        id: '123',
        type: 'PAYMENT',
        amount: 500,
        description: 'Test',
        status: 'SUCCESS',
        createdAt: '2024-01-15T10:00:00Z',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockTransaction);

      const result = await transactionService.getTransactionById('123');

      expect(apiService.get).toHaveBeenCalledWith('/transactions/123');
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('downloadReceipt', () => {
    it('fetches receipt download URL', async () => {
      const mockReceipt = {
        url: 'https://example.com/receipt.pdf',
        fileName: 'receipt_123.pdf',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockReceipt);

      const result = await transactionService.downloadReceipt('123');

      expect(apiService.get).toHaveBeenCalledWith('/transactions/123/receipt');
      expect(result).toEqual(mockReceipt);
    });
  });

  describe('getReceiptData', () => {
    it('fetches receipt data for sharing', async () => {
      const mockReceiptData = {
        data: 'base64encodeddata',
        mimeType: 'application/pdf',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockReceiptData);

      const result = await transactionService.getReceiptData('123');

      expect(apiService.get).toHaveBeenCalledWith('/transactions/123/receipt/data');
      expect(result).toEqual(mockReceiptData);
    });
  });
});
