import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  Min,
  IsEnum,
  IsBoolean,
} from 'class-validator';

export enum PaymentMethodEnum {
  UPI = 'UPI',
  CARD = 'CARD',
  NETBANKING = 'NETBANKING',
  WALLET = 'WALLET',
  EMI = 'EMI',
}

// Create Payment Order DTO
export class CreatePaymentDto {
  @ApiProperty({ example: 1000, description: 'Payment amount in INR' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ example: 'merchant@upi', description: 'Merchant UPI ID' })
  @IsString()
  @IsOptional()
  merchantUpiId?: string;

  @ApiPropertyOptional({ example: 'Coffee Shop', description: 'Merchant name' })
  @IsString()
  @IsOptional()
  merchantName?: string;

  @ApiPropertyOptional({
    example: 'Payment for order #12345',
    description: 'Payment description'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: PaymentMethodEnum,
    example: PaymentMethodEnum.UPI,
    description: 'Preferred payment method'
  })
  @IsEnum(PaymentMethodEnum)
  @IsOptional()
  paymentMethod?: PaymentMethodEnum;
}

// Verify Payment DTO
export class VerifyPaymentDto {
  @ApiProperty({
    example: 'order_MHhNlbxxxxxx',
    description: 'Razorpay order ID'
  })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @ApiProperty({
    example: 'pay_MHhNxxxxxx',
    description: 'Razorpay payment ID'
  })
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId: string;

  @ApiProperty({
    example: 'c8a5d3xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'Razorpay signature for verification'
  })
  @IsString()
  @IsNotEmpty()
  razorpaySignature: string;
}

// Razorpay Webhook DTO
export class RazorpayWebhookDto {
  @ApiProperty({ example: 'payment.captured', description: 'Event type' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ description: 'Webhook payload' })
  @IsNotEmpty()
  payload: any;
}

// Query DTOs
export class GetTransactionsDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: ['PENDING', 'SUCCESS', 'FAILED'],
    description: 'Filter by status'
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    enum: ['PAYMENT', 'DEPOSIT', 'WITHDRAWAL', 'INVESTMENT', 'REDEMPTION'],
    description: 'Filter by transaction type'
  })
  @IsString()
  @IsOptional()
  type?: string;
}

// Cancel Payment DTO
export class CancelPaymentDto {
  @ApiProperty({
    example: 'order_MHhNlbxxxxxx',
    description: 'Razorpay order ID to cancel'
  })
  @IsString()
  @IsNotEmpty()
  razorpayOrderId: string;

  @ApiPropertyOptional({
    example: 'User cancelled',
    description: 'Reason for cancellation'
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
