import { IsString, IsNotEmpty, IsOptional, IsEmail, Length } from 'class-validator';

export class InitiateTransferDto {
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @IsString()
  @IsOptional()
  recipientPhone?: string;

  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class ClaimTransferDto {
  @IsString()
  @IsNotEmpty()
  @Length(12, 12)
  transferCode: string;
}

export class CancelTransferDto {
  @IsString()
  @IsNotEmpty()
  transferId: string;
}
