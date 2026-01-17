import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class JoinWaitlistDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsOptional()
  ticketTypeId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class LeaveWaitlistDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;
}
