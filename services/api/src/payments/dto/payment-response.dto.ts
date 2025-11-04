import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentOrderResponseDto {
  @ApiProperty({ example: 'order_MHhNlbxxxxxx', description: 'Razorpay order ID' })
  orderId: string;

  @ApiProperty({ example: 1000, description: 'Order amount in paise' })
  amount: number;

  @ApiProperty({ example: 'INR', description: 'Currency code' })
  currency: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ example: 100, description: 'Auto-save amount in paise' })
  autoSaveAmount: number;

  @ApiProperty({ example: 10, description: 'Auto-save percentage' })
  autoSavePercentage: number;

  @ApiPropertyOptional({ example: 'rzp_test_xxxxxx', description: 'Razorpay key for frontend' })
  razorpayKey?: string;
}

export class PaymentVerificationResponseDto {
  @ApiProperty({ example: true, description: 'Payment verification status' })
  success: boolean;

  @ApiProperty({ example: 'Payment verified successfully', description: 'Status message' })
  message: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Transaction ID' })
  transactionId: string;

  @ApiProperty({ example: 1000, description: 'Payment amount' })
  amount: number;

  @ApiProperty({ example: 100, description: 'Auto-saved amount' })
  autoSavedAmount: number;

  @ApiProperty({ example: 5100, description: 'Updated savings wallet balance' })
  savingsBalance: number;

  @ApiProperty({ example: 'UPI', description: 'Payment method used' })
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'ABC1234567890', description: 'UTR number' })
  utr?: string;
}

export class TransactionResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'PAYMENT' })
  type: string;

  @ApiProperty({ example: 1000 })
  amount: number;

  @ApiProperty({ example: 'SUCCESS' })
  status: string;

  @ApiPropertyOptional({ example: 'Coffee Shop' })
  merchantName?: string;

  @ApiPropertyOptional({ example: 'merchant@upi' })
  merchantUpiId?: string;

  @ApiPropertyOptional({ example: 'ABC1234567890' })
  utr?: string;

  @ApiProperty({ example: 100 })
  autoSaveAmount: number;

  @ApiProperty({ example: true })
  autoSaveApplied: boolean;

  @ApiPropertyOptional({ example: 'UPI' })
  paymentMethod?: string;

  @ApiPropertyOptional({ example: 'user@upi' })
  vpa?: string;

  @ApiPropertyOptional({ example: 'Payment for order #12345' })
  description?: string;

  @ApiProperty({ example: '2024-01-01T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T10:00:00.000Z' })
  updatedAt: Date;
}

export class TransactionListResponseDto {
  @ApiProperty({ type: [TransactionResponseDto] })
  transactions: TransactionResponseDto[];

  @ApiProperty({ example: 1, description: 'Current page' })
  page: number;

  @ApiProperty({ example: 20, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 150, description: 'Total number of transactions' })
  total: number;

  @ApiProperty({ example: 8, description: 'Total pages' })
  totalPages: number;
}

export class PaymentStatsResponseDto {
  @ApiProperty({ example: 150, description: 'Total number of payments' })
  totalPayments: number;

  @ApiProperty({ example: 150000, description: 'Total amount paid' })
  totalAmount: number;

  @ApiProperty({ example: 15000, description: 'Total amount saved via auto-save' })
  totalAutoSaved: number;

  @ApiProperty({ example: 140, description: 'Successful payments' })
  successfulPayments: number;

  @ApiProperty({ example: 5, description: 'Failed payments' })
  failedPayments: number;

  @ApiProperty({ example: 10, description: 'Average savings percentage' })
  avgSavingsPercentage: number;
}
