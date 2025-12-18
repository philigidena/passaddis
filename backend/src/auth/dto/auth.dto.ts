import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsEmail,
  MinLength,
} from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

// Email/Password Authentication DTOs
export class EmailRegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class EmailLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    phone: string | null;
    name: string | null;
    email: string | null;
    role: string;
  };
}
