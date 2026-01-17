import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
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
}

export class ValidateTicketDto {
  @IsString()
  @IsNotEmpty()
  qrCode: string;
}
