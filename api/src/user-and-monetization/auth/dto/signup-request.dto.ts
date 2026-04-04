import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignupRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}