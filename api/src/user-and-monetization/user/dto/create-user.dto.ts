import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  country?: string;

  // Role assigned to the user
  @IsOptional()
  @IsString()
  roleId?: string;

  // Email verification
  @IsOptional()
  @IsString()
  verificationToken?: string;

  @IsOptional()
  @Type(() => Date)
  verificationTokenExpiry?: Date;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  // Password reset
  @IsOptional()
  @IsString()
  passwordResetToken?: string;

  @IsOptional()
  @Type(() => Date)
  passwordResetTokenExpiry?: Date;
}
