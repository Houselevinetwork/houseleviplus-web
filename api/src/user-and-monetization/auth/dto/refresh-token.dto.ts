// src/user-and-monetization/auth/dto/refresh-token.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * 🔄 Refresh Token DTO
 * 
 * Sent when access token expires (every 10 minutes)
 * Backend validates, rotates token, returns new access + refresh tokens
 */
export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string; // 128-character hex string
}