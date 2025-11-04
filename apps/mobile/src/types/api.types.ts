// API Request & Response Types

// Auth Types
export interface RegisterRequest {
  mobile: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface VerifyOtpRequest {
  mobile: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// User Types
export interface User {
  id: string;
  mobile: string;
  name: string | null;
  email: string | null;
  kycLevel: 0 | 1 | 2;
  kycStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  pincode?: string;
  city?: string;
  state?: string;
}

// KYC Types
export interface VerifyPanRequest {
  panNumber: string;
  name: string;
  dateOfBirth: string;
}

export interface VerifyAadhaarRequest {
  aadhaarNumber: string;
  consent: boolean;
}

export interface VerifyLivenessRequest {
  selfieImage: string; // base64
  aadhaarNumber: string;
}

export interface KycDocument {
  id: string;
  userId: string;
  documentType: 'PAN' | 'AADHAAR' | 'BANK_STATEMENT';
  documentNumber: string;
  verified: boolean;
  verificationDate: string | null;
  rejectionReason: string | null;
  livenessScore: number | null;
  livenessVerified: boolean;
}

// Bank Account Types
export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string; // last 4 digits visible
  ifscCode: string;
  accountHolderName: string;
  bankName: string;
  isPrimary: boolean;
  verified: boolean;
  createdAt: string;
}

export interface AddBankAccountRequest {
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface VerifyBankAccountRequest {
  accountId: string;
}

// Onboarding Types
export type OnboardingStep =
  | 'REGISTRATION'
  | 'PROFILE_SETUP'
  | 'PAN_VERIFICATION'
  | 'AADHAAR_VERIFICATION'
  | 'LIVENESS_CHECK'
  | 'BANK_ACCOUNT'
  | 'DASHBOARD';

export interface OnboardingStatus {
  currentStep: OnboardingStep;
  kycLevel: 0 | 1 | 2;
  kycStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  completionStatus: {
    profileComplete: boolean;
    panVerified: boolean;
    aadhaarVerified: boolean;
    livenessVerified: boolean;
    bankAccountAdded: boolean;
  };
  permissions: {
    canMakePayments: boolean;
    maxPaymentAmount: number | null;
    canInvest: boolean;
    canWithdraw: boolean;
  };
}

// Payment Types
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  savingsAmount: number;
  savingsPercentage: number;
  merchantName: string;
  upiTransactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: string;
}

export interface CreatePaymentRequest {
  merchantUpiId: string;
  amount: number;
  savingsPercentage: number;
}

// Savings Types
export interface SavingsWallet {
  balance: number;
  totalSaved: number;
  transactionCount: number;
  lastTransactionDate: string | null;
}

export interface SavingsTransaction {
  id: string;
  userId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface WithdrawSavingsRequest {
  amount: number;
  bankAccountId: string;
}

// Investment Types
export interface InvestmentFund {
  id: string;
  name: string;
  category: 'EQUITY' | 'DEBT' | 'HYBRID' | 'LIQUID';
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  minimumInvestment: number;
  currentNav: number;
  returns1Year: number;
  returns3Year: number | null;
  returns5Year: number | null;
  description: string;
}

export interface UserInvestment {
  id: string;
  userId: string;
  fundId: string;
  fund: InvestmentFund;
  units: number;
  investedAmount: number;
  currentValue: number;
  purchaseNav: number;
  purchaseDate: string;
  status: 'ACTIVE' | 'REDEEMED';
}

export interface PurchaseInvestmentRequest {
  fundId: string;
  amount: number;
}

export interface RedeemInvestmentRequest {
  investmentId: string;
  units?: number; // Partial redemption
  fullRedemption?: boolean;
}

// Analytics Types
export interface SavingsAnalytics {
  totalSaved: number;
  savingsThisMonth: number;
  savingsThisWeek: number;
  averageSavingsPerTransaction: number;
  savingsGrowthPercentage: number;
  topMerchants: Array<{
    merchantName: string;
    totalSaved: number;
    transactionCount: number;
  }>;
  savingsTrend: Array<{
    date: string;
    amount: number;
  }>;
}

export interface InvestmentAnalytics {
  totalInvested: number;
  currentValue: number;
  totalReturns: number;
  returnsPercentage: number;
  portfolioAllocation: Array<{
    category: string;
    percentage: number;
    value: number;
  }>;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'PAYMENT' | 'SAVINGS' | 'INVESTMENT' | 'KYC' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Transaction History Types (Unified view of all transactions)
export type TransactionType = 'PAYMENT' | 'SAVINGS_CREDIT' | 'SAVINGS_DEBIT' | 'INVESTMENT_PURCHASE' | 'INVESTMENT_REDEMPTION';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  createdAt: string;
  // Type-specific fields (optional based on type)
  merchantName?: string;
  upiTransactionId?: string;
  fundName?: string;
  units?: number;
  savingsAmount?: number;
  balanceAfter?: number;
}

export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface TransactionFilters {
  type?: TransactionType | 'ALL';
  status?: TransactionStatus | 'ALL';
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Error Types
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
}
