import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  roleId: string; // reference to role

  // ✅ Added optional fields for AuthService
  @IsOptional()
  @IsString()
  verificationToken?: string;

  @IsOptional()
  verificationTokenExpiry?: Date;

  @IsOptional()
  emailVerified?: boolean;

  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @IsOptional()
  passwordResetTokenExpiry?: Date;
}
