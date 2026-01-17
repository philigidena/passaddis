import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { PurchaseTicketsDto, ValidateTicketDto } from './dto/tickets.dto';
import {
  InitiateTransferDto,
  ClaimTransferDto,
  CancelTransferDto,
} from './dto/transfer.dto';
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

  // ============== TICKET TRANSFER ENDPOINTS ==============

  @Post('transfer/initiate')
  async initiateTransfer(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiateTransferDto,
  ) {
    return this.ticketsService.initiateTransfer(userId, dto);
  }

  @Post('transfer/claim')
  async claimTransfer(
    @CurrentUser('id') userId: string,
    @Body() dto: ClaimTransferDto,
  ) {
    return this.ticketsService.claimTransfer(userId, dto);
  }

  @Delete('transfer/cancel')
  async cancelTransfer(
    @CurrentUser('id') userId: string,
    @Body() dto: CancelTransferDto,
  ) {
    return this.ticketsService.cancelTransfer(userId, dto);
  }

  @Get('transfer/pending')
  async getPendingTransfers(@CurrentUser('id') userId: string) {
    return this.ticketsService.getPendingTransfers(userId);
  }

  @Get('transfer/history')
  async getTransferHistory(@CurrentUser('id') userId: string) {
    return this.ticketsService.getTransferHistory(userId);
  }
}
