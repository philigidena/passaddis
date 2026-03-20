import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TicketPurchaseItemDto {
  @IsString()
  @IsNotEmpty()
  ticketTypeId: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  quantity: number;
}

export class PurchaseTicketsDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketPurchaseItemDto)
  tickets: TicketPurchaseItemDto[];

  // Gift ticket fields
  @IsBoolean()
  @IsOptional()
  isGift?: boolean;

  @IsString()
  @IsOptional()
  recipientPhone?: string;

  @IsString()
  @IsOptional()
  recipientName?: string;

  @IsString()
  @IsOptional()
  giftMessage?: string;
}

export class ValidateTicketDto {
  @IsString()
  @IsNotEmpty()
  qrCode: string;
}
