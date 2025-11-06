import SavingsService from '../savings.service';
import apiService from '../api.service';
import {
  SavingsWallet,
  SavingsTransaction,
  WithdrawSavingsRequest,
  SavingsAnalytics,
} from '@/types/api.types';

// Mock dependencies
jest.mock('../api.service');

describe('SavingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getWallet', () => {
    it('should fetch savings wallet balance', async () => {
      const mockWallet: SavingsWallet = {
        balance: 10000,
        lockedAmount: 2000,
        availableBalance: 8000,
        totalDeposited: 15000,
        totalWithdrawn: 5000,
        interestEarned: 500,
        currency: 'INR',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockWallet);

      const result = await SavingsService.getWallet();

      expect(result).toEqual(mockWallet);
      expect(result.balance).toBe(10000);
      expect(result.availableBalance).toBe(8000);
      expect(apiService.get).toHaveBeenCalledWith('/savings/wallet');
    });

    it('should fetch empty wallet for new user', async () => {
      const mockWallet: SavingsWallet = {
        balance: 0,
        lockedAmount: 0,
        availableBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        interestEarned: 0,
        currency: 'INR',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockWallet);

      const result = await SavingsService.getWallet();

      expect(result.balance).toBe(0);
      expect(result.totalDeposited).toBe(0);
    });

    it('should handle API errors', async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(SavingsService.getWallet()).rejects.toThrow('Network error');
    });
  });

  describe('getTransactions', () => {
    it('should fetch all transactions without params', async () => {
      const mockTransactions: SavingsTransaction[] = [
        {
          id: 'txn1',
          type: 'CREDIT',
          amount: 1000,
          balance: 11000,
          description: 'Auto-save from payment',
          createdAt: '2023-12-01T10:00:00Z',
        },
        {
          id: 'txn2',
          type: 'DEBIT',
          amount: 500,
          balance: 10500,
          description: 'Withdrawal to bank',
          createdAt: '2023-12-02T10:00:00Z',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await SavingsService.getTransactions();

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('CREDIT');
      expect(result[1].type).toBe('DEBIT');
      expect(apiService.get).toHaveBeenCalledWith('/savings/transactions');
    });

    it('should fetch transactions with limit', async () => {
      const mockTransactions: SavingsTransaction[] = [
        {
          id: 'txn1',
          type: 'CREDIT',
          amount: 1000,
          balance: 11000,
          description: 'Auto-save',
          createdAt: '2023-12-01T10:00:00Z',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await SavingsService.getTransactions({ limit: 10 });

      expect(result).toHaveLength(1);
      expect(apiService.get).toHaveBeenCalledWith('/savings/transactions?limit=10');
    });

    it('should fetch transactions with offset and limit', async () => {
      const mockTransactions: SavingsTransaction[] = [];

      (apiService.get as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await SavingsService.getTransactions({
        limit: 10,
        offset: 20,
      });

      expect(result).toEqual([]);
      expect(apiService.get).toHaveBeenCalledWith('/savings/transactions?limit=10&offset=20');
    });

    it('should fetch only credit transactions', async () => {
      const mockTransactions: SavingsTransaction[] = [
        {
          id: 'txn1',
          type: 'CREDIT',
          amount: 1000,
          balance: 11000,
          description: 'Auto-save',
          createdAt: '2023-12-01T10:00:00Z',
        },
        {
          id: 'txn3',
          type: 'CREDIT',
          amount: 500,
          balance: 11500,
          description: 'Manual deposit',
          createdAt: '2023-12-03T10:00:00Z',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await SavingsService.getTransactions({ type: 'CREDIT' });

      expect(result).toHaveLength(2);
      expect(result.every(t => t.type === 'CREDIT')).toBe(true);
      expect(apiService.get).toHaveBeenCalledWith('/savings/transactions?type=CREDIT');
    });

    it('should fetch only debit transactions', async () => {
      const mockTransactions: SavingsTransaction[] = [
        {
          id: 'txn2',
          type: 'DEBIT',
          amount: 500,
          balance: 10500,
          description: 'Withdrawal',
          createdAt: '2023-12-02T10:00:00Z',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await SavingsService.getTransactions({ type: 'DEBIT' });

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('DEBIT');
      expect(apiService.get).toHaveBeenCalledWith('/savings/transactions?type=DEBIT');
    });

    it('should fetch transactions with all params', async () => {
      const mockTransactions: SavingsTransaction[] = [];

      (apiService.get as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await SavingsService.getTransactions({
        limit: 5,
        offset: 10,
        type: 'CREDIT',
      });

      expect(apiService.get).toHaveBeenCalledWith(
        '/savings/transactions?limit=5&offset=10&type=CREDIT'
      );
    });

    it('should return empty array when no transactions', async () => {
      (apiService.get as jest.Mock).mockResolvedValue([]);

      const result = await SavingsService.getTransactions();

      expect(result).toEqual([]);
    });
  });

  describe('withdraw', () => {
    it('should withdraw funds successfully', async () => {
      const data: WithdrawSavingsRequest = {
        amount: 5000,
        bankAccountId: 'bank1',
      };

      const mockResponse = {
        message: 'Withdrawal initiated successfully',
        transactionId: 'txn123',
        amount: 5000,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SavingsService.withdraw(data);

      expect(result).toEqual(mockResponse);
      expect(result.transactionId).toBe('txn123');
      expect(result.amount).toBe(5000);
      expect(apiService.post).toHaveBeenCalledWith('/savings/withdraw', data);
    });

    it('should handle insufficient balance', async () => {
      const data: WithdrawSavingsRequest = {
        amount: 100000,
        bankAccountId: 'bank1',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Insufficient balance'));

      await expect(SavingsService.withdraw(data)).rejects.toThrow('Insufficient balance');
    });

    it('should handle minimum withdrawal amount', async () => {
      const data: WithdrawSavingsRequest = {
        amount: 50,
        bankAccountId: 'bank1',
      };

      (apiService.post as jest.Mock).mockRejectedValue(
        new Error('Minimum withdrawal amount is ₹100')
      );

      await expect(SavingsService.withdraw(data)).rejects.toThrow('Minimum withdrawal');
    });

    it('should handle invalid bank account', async () => {
      const data: WithdrawSavingsRequest = {
        amount: 5000,
        bankAccountId: 'invalid',
      };

      (apiService.post as jest.Mock).mockRejectedValue(new Error('Bank account not found'));

      await expect(SavingsService.withdraw(data)).rejects.toThrow('Bank account not found');
    });

    it('should handle unverified bank account', async () => {
      const data: WithdrawSavingsRequest = {
        amount: 5000,
        bankAccountId: 'bank2',
      };

      (apiService.post as jest.Mock).mockRejectedValue(
        new Error('Bank account not verified')
      );

      await expect(SavingsService.withdraw(data)).rejects.toThrow('not verified');
    });

    it('should include optional reason in withdrawal', async () => {
      const data: WithdrawSavingsRequest = {
        amount: 5000,
        bankAccountId: 'bank1',
        reason: 'Emergency expense',
      };

      const mockResponse = {
        message: 'Withdrawal initiated',
        transactionId: 'txn123',
        amount: 5000,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SavingsService.withdraw(data);

      expect(result.transactionId).toBeDefined();
      expect(apiService.post).toHaveBeenCalledWith('/savings/withdraw', data);
    });
  });

  describe('getAnalytics', () => {
    it('should fetch savings analytics', async () => {
      const mockAnalytics: SavingsAnalytics = {
        totalSaved: 50000,
        thisMonthSavings: 5000,
        lastMonthSavings: 4500,
        averageMonthlySavings: 4200,
        savingsGoalProgress: 60,
        savingsGoalTarget: 100000,
        interestEarned: 1500,
        totalTransactions: 120,
        topSavingSources: [
          { source: 'Auto-save', amount: 30000, percentage: 60 },
          { source: 'Manual deposit', amount: 20000, percentage: 40 },
        ],
        monthlyTrend: [
          { month: '2023-01', amount: 3000 },
          { month: '2023-02', amount: 4000 },
          { month: '2023-03', amount: 5000 },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockAnalytics);

      const result = await SavingsService.getAnalytics();

      expect(result).toEqual(mockAnalytics);
      expect(result.totalSaved).toBe(50000);
      expect(result.savingsGoalProgress).toBe(60);
      expect(result.topSavingSources).toHaveLength(2);
      expect(result.monthlyTrend).toHaveLength(3);
      expect(apiService.get).toHaveBeenCalledWith('/analytics/savings');
    });

    it('should fetch analytics for new user', async () => {
      const mockAnalytics: SavingsAnalytics = {
        totalSaved: 0,
        thisMonthSavings: 0,
        lastMonthSavings: 0,
        averageMonthlySavings: 0,
        savingsGoalProgress: 0,
        savingsGoalTarget: 0,
        interestEarned: 0,
        totalTransactions: 0,
        topSavingSources: [],
        monthlyTrend: [],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockAnalytics);

      const result = await SavingsService.getAnalytics();

      expect(result.totalSaved).toBe(0);
      expect(result.topSavingSources).toHaveLength(0);
    });

    it('should handle API errors', async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error('Failed to fetch analytics'));

      await expect(SavingsService.getAnalytics()).rejects.toThrow('Failed to fetch analytics');
    });
  });

  describe('Complete Savings Flow', () => {
    it('should complete full savings and withdrawal cycle', async () => {
      // Step 1: Get initial wallet balance
      const initialWallet: SavingsWallet = {
        balance: 10000,
        lockedAmount: 0,
        availableBalance: 10000,
        totalDeposited: 10000,
        totalWithdrawn: 0,
        interestEarned: 100,
        currency: 'INR',
      };

      (apiService.get as jest.Mock).mockResolvedValue(initialWallet);
      const wallet1 = await SavingsService.getWallet();
      expect(wallet1.balance).toBe(10000);

      // Step 2: View transactions
      const mockTransactions: SavingsTransaction[] = [
        {
          id: 'txn1',
          type: 'CREDIT',
          amount: 5000,
          balance: 5000,
          description: 'Initial deposit',
          createdAt: '2023-11-01T10:00:00Z',
        },
        {
          id: 'txn2',
          type: 'CREDIT',
          amount: 5000,
          balance: 10000,
          description: 'Auto-save',
          createdAt: '2023-11-15T10:00:00Z',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockTransactions);
      const transactions = await SavingsService.getTransactions();
      expect(transactions).toHaveLength(2);

      // Step 3: Withdraw funds
      const withdrawData: WithdrawSavingsRequest = {
        amount: 3000,
        bankAccountId: 'bank1',
      };

      const mockWithdrawResponse = {
        message: 'Withdrawal successful',
        transactionId: 'txn3',
        amount: 3000,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockWithdrawResponse);
      const withdrawResult = await SavingsService.withdraw(withdrawData);
      expect(withdrawResult.transactionId).toBe('txn3');

      // Step 4: Check updated balance
      const updatedWallet: SavingsWallet = {
        balance: 7000,
        lockedAmount: 0,
        availableBalance: 7000,
        totalDeposited: 10000,
        totalWithdrawn: 3000,
        interestEarned: 100,
        currency: 'INR',
      };

      (apiService.get as jest.Mock).mockResolvedValue(updatedWallet);
      const wallet2 = await SavingsService.getWallet();
      expect(wallet2.balance).toBe(7000);
      expect(wallet2.totalWithdrawn).toBe(3000);

      // Step 5: View analytics
      const mockAnalytics: SavingsAnalytics = {
        totalSaved: 7000,
        thisMonthSavings: 10000,
        lastMonthSavings: 0,
        averageMonthlySavings: 5000,
        savingsGoalProgress: 70,
        savingsGoalTarget: 10000,
        interestEarned: 100,
        totalTransactions: 3,
        topSavingSources: [
          { source: 'Auto-save', amount: 5000, percentage: 50 },
          { source: 'Manual', amount: 5000, percentage: 50 },
        ],
        monthlyTrend: [{ month: '2023-11', amount: 10000 }],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockAnalytics);
      const analytics = await SavingsService.getAnalytics();
      expect(analytics.totalSaved).toBe(7000);
      expect(analytics.totalTransactions).toBe(3);
    });

    it('should handle multiple consecutive withdrawals', async () => {
      // Initial balance: ₹10,000
      let currentBalance = 10000;

      // Withdrawal 1: ₹2000
      const withdraw1: WithdrawSavingsRequest = {
        amount: 2000,
        bankAccountId: 'bank1',
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        message: 'Withdrawal 1 successful',
        transactionId: 'txn1',
        amount: 2000,
      });
      await SavingsService.withdraw(withdraw1);
      currentBalance -= 2000;

      // Withdrawal 2: ₹3000
      const withdraw2: WithdrawSavingsRequest = {
        amount: 3000,
        bankAccountId: 'bank1',
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        message: 'Withdrawal 2 successful',
        transactionId: 'txn2',
        amount: 3000,
      });
      await SavingsService.withdraw(withdraw2);
      currentBalance -= 3000;

      // Check final balance: ₹5,000
      const finalWallet: SavingsWallet = {
        balance: currentBalance,
        lockedAmount: 0,
        availableBalance: currentBalance,
        totalDeposited: 10000,
        totalWithdrawn: 5000,
        interestEarned: 0,
        currency: 'INR',
      };

      (apiService.get as jest.Mock).mockResolvedValue(finalWallet);
      const wallet = await SavingsService.getWallet();
      expect(wallet.balance).toBe(5000);
      expect(wallet.totalWithdrawn).toBe(5000);
    });

    it('should handle locked amount scenario', async () => {
      // Wallet with locked amount
      const walletWithLock: SavingsWallet = {
        balance: 10000,
        lockedAmount: 3000,
        availableBalance: 7000,
        totalDeposited: 10000,
        totalWithdrawn: 0,
        interestEarned: 100,
        currency: 'INR',
      };

      (apiService.get as jest.Mock).mockResolvedValue(walletWithLock);
      const wallet = await SavingsService.getWallet();
      expect(wallet.availableBalance).toBe(7000);

      // Try to withdraw more than available (should fail)
      const withdrawData: WithdrawSavingsRequest = {
        amount: 8000,
        bankAccountId: 'bank1',
      };

      (apiService.post as jest.Mock).mockRejectedValue(
        new Error('Withdrawal amount exceeds available balance')
      );

      await expect(SavingsService.withdraw(withdrawData)).rejects.toThrow(
        'exceeds available balance'
      );

      // Withdraw within available amount (should succeed)
      const validWithdraw: WithdrawSavingsRequest = {
        amount: 5000,
        bankAccountId: 'bank1',
      };

      (apiService.post as jest.Mock).mockResolvedValue({
        message: 'Withdrawal successful',
        transactionId: 'txn1',
        amount: 5000,
      });

      const result = await SavingsService.withdraw(validWithdraw);
      expect(result.amount).toBe(5000);
    });
  });
});
