import investmentService from '../investment.service';
import apiService from '../api.service';

jest.mock('../api.service');

describe('InvestmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFunds', () => {
    it('should get all funds without filters', async () => {
      const mockFunds = [
        {
          id: 'fund-1',
          name: 'Test Equity Fund',
          category: 'EQUITY',
          riskLevel: 'HIGH',
          minimumInvestment: 500,
          currentNav: 150.25,
          returns1Year: 12.5,
          returns3Year: 35.2,
          returns5Year: 68.9,
          description: 'Test fund',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockFunds);

      const result = await investmentService.getFunds();

      expect(result).toEqual(mockFunds);
      expect(apiService.get).toHaveBeenCalledWith('/investments/funds');
    });

    it('should get funds with category filter', async () => {
      const mockFunds = [];
      (apiService.get as jest.Mock).mockResolvedValue(mockFunds);

      await investmentService.getFunds({ category: 'EQUITY' });

      expect(apiService.get).toHaveBeenCalledWith('/investments/funds?category=EQUITY');
    });

    it('should get funds with multiple filters', async () => {
      const mockFunds = [];
      (apiService.get as jest.Mock).mockResolvedValue(mockFunds);

      await investmentService.getFunds({
        category: 'EQUITY',
        riskLevel: 'HIGH',
        search: 'growth',
      });

      expect(apiService.get).toHaveBeenCalledWith(
        '/investments/funds?category=EQUITY&riskLevel=HIGH&search=growth'
      );
    });
  });

  describe('getFundById', () => {
    it('should get fund details by ID', async () => {
      const mockFund = {
        id: 'fund-1',
        name: 'Test Fund',
        category: 'EQUITY',
        riskLevel: 'MODERATE',
        minimumInvestment: 500,
        currentNav: 150.25,
        returns1Year: 12.5,
        returns3Year: null,
        returns5Year: null,
        description: 'Test fund description',
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockFund);

      const result = await investmentService.getFundById('fund-1');

      expect(result).toEqual(mockFund);
      expect(apiService.get).toHaveBeenCalledWith('/investments/funds/fund-1');
    });
  });

  describe('purchaseInvestment', () => {
    it('should purchase investment', async () => {
      const mockInvestment = {
        id: 'inv-1',
        userId: 'user-1',
        fundId: 'fund-1',
        fund: {
          id: 'fund-1',
          name: 'Test Fund',
          category: 'EQUITY',
          riskLevel: 'MODERATE',
          minimumInvestment: 500,
          currentNav: 150.25,
          returns1Year: 12.5,
          returns3Year: null,
          returns5Year: null,
          description: 'Test',
        },
        units: 6.6555,
        investedAmount: 1000,
        currentValue: 1000,
        purchaseNav: 150.25,
        purchaseDate: '2024-01-01',
        status: 'ACTIVE',
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockInvestment);

      const result = await investmentService.purchaseInvestment({
        fundId: 'fund-1',
        amount: 1000,
      });

      expect(result).toEqual(mockInvestment);
      expect(apiService.post).toHaveBeenCalledWith('/investments/purchase', {
        fundId: 'fund-1',
        amount: 1000,
      });
    });
  });

  describe('getMyInvestments', () => {
    it('should get user investments', async () => {
      const mockInvestments = [
        {
          id: 'inv-1',
          userId: 'user-1',
          fundId: 'fund-1',
          fund: {
            id: 'fund-1',
            name: 'Test Fund',
            category: 'EQUITY',
            riskLevel: 'MODERATE',
            minimumInvestment: 500,
            currentNav: 150.25,
            returns1Year: 12.5,
            returns3Year: null,
            returns5Year: null,
            description: 'Test',
          },
          units: 6.6555,
          investedAmount: 1000,
          currentValue: 1050,
          purchaseNav: 150.25,
          purchaseDate: '2024-01-01',
          status: 'ACTIVE',
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockInvestments);

      const result = await investmentService.getMyInvestments();

      expect(result).toEqual(mockInvestments);
      expect(apiService.get).toHaveBeenCalledWith('/investments/my-investments');
    });
  });

  describe('getAnalytics', () => {
    it('should get investment analytics', async () => {
      const mockAnalytics = {
        totalInvested: 5000,
        currentValue: 5500,
        totalReturns: 500,
        returnsPercentage: 10,
        portfolioAllocation: [
          { category: 'EQUITY', percentage: 60, value: 3300 },
          { category: 'DEBT', percentage: 40, value: 2200 },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockAnalytics);

      const result = await investmentService.getAnalytics();

      expect(result).toEqual(mockAnalytics);
      expect(apiService.get).toHaveBeenCalledWith('/analytics/investments');
    });
  });

  describe('redeemInvestment', () => {
    it('should redeem full investment', async () => {
      const mockResponse = {
        message: 'Investment redeemed successfully',
        redemptionAmount: 1050,
        units: 6.6555,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await investmentService.redeemInvestment({
        investmentId: 'inv-1',
        fullRedemption: true,
      });

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith('/investments/redeem', {
        investmentId: 'inv-1',
        fullRedemption: true,
      });
    });

    it('should redeem partial investment', async () => {
      const mockResponse = {
        message: 'Investment redeemed successfully',
        redemptionAmount: 525,
        units: 3.3278,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await investmentService.redeemInvestment({
        investmentId: 'inv-1',
        units: 3.3278,
      });

      expect(result).toEqual(mockResponse);
      expect(apiService.post).toHaveBeenCalledWith('/investments/redeem', {
        investmentId: 'inv-1',
        units: 3.3278,
      });
    });
  });
});
