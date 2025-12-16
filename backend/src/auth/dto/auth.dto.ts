import {
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  Length,
  IsOptional,
  IsEmail,
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

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    phone: string;
    name: string | null;
    email: string | null;
    role: string;
  };
}
