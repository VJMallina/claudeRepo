import { IsString, IsEmail, IsDateString, IsOptional, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: '9876543210', description: 'Mobile number without country code' })
  @IsString()
  @Length(10, 10)
  @Matches(/^[0-9]+$/, { message: 'Mobile number must contain only digits' })
  mobile: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Length(10, 10)
  mobile: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsString()
  @Length(6, 6)
  @Matches(/^[0-9]+$/, { message: 'OTP must be 6 digits' })
  code: string;
}

export class CreateProfileDto {
  @ApiProperty({ example: 'Rahul Sharma' })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({ example: 'rahul@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '1995-01-15' })
  @IsDateString()
  dob: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
  @IsOptional()
  @IsString()
  profilePhoto?: string;
}

export class SetPinDto {
  @ApiProperty({ example: '123456', description: '4-6 digit PIN' })
  @IsString()
  @Length(4, 6)
  @Matches(/^[0-9]+$/, { message: 'PIN must contain only digits' })
  pin: string;
}

export class LoginWithPinDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Length(10, 10)
  mobile: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(4, 6)
  pin: string;
}

export class LoginWithOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Length(10, 10)
  mobile: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken: string;
}

export class ResetPinDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @Length(10, 10)
  mobile: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({ example: '654321' })
  @IsString()
  @Length(4, 6)
  newPin: string;
}
