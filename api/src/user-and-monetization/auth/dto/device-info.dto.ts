import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class DeviceInfoDto {
  @IsNotEmpty()
  @IsString()
  deviceId: string; // Stable hash from fingerprint

  @IsNotEmpty()
  @IsIn(['phone', 'laptop', 'tv', 'tablet', 'unknown'])
  deviceType: 'phone' | 'laptop' | 'tv' | 'tablet' | 'unknown';

  @IsNotEmpty()
  @IsString()
  deviceName: string; // e.g., "Chrome 120 on Windows 11"

  @IsOptional()
  @IsString()
  os?: string; // e.g., "Windows 11"

  @IsOptional()
  @IsString()
  browser?: string; // e.g., "Chrome 120"

  @IsOptional()
  @IsString()
  appVersion?: string;
}