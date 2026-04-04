import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  Matches,
  IsOptional,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DeviceInfoDto } from './device-info.dto';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'Phone number must be valid international format (8-15 digits)',
  })
  phoneNumber: string; // 🌍 Worldwide: +1234567890 or 1234567890

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @IsOptional()
  @IsMongoId()
  roleId?: string;

  // 🔐 NETFLIX-GRADE: Device tracking
  // ✅ This will be injected by auth.controller.ts using DeviceFingerprintHelper
  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceInfoDto)
  deviceInfo?: DeviceInfoDto;
}