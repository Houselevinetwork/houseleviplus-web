/**
 * Email Discovery DTO
 */

import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDiscoveryDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
