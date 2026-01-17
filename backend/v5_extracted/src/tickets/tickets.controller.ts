import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PurchaseTicketsDto, ValidateTicketDto } from './dto/tickets.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post('purchase')
  async purchaseTickets(
    @CurrentUser('id') userId: string,
    @Body() dto: PurchaseTicketsDto,
  ) {
    return this.ticketsService.purchaseTickets(userId, dto);
  }

  @Get('my-tickets')
  async getMyTickets(@CurrentUser('id') userId: string) {
    return this.ticketsService.getUserTickets(userId);
  }

  @Get(':id')
  async getTicket(
    @CurrentUser('id') userId: string,
    @Param('id') ticketId: string,
  ) {
    return this.ticketsService.getTicket(userId, ticketId);
  }

  @Post('validate')
  async validateTicket(@Body() dto: ValidateTicketDto) {
    return this.ticketsService.validateTicket(dto);
  }
}
