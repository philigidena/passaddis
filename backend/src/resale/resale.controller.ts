import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ResaleService } from './resale.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('resale')
export class ResaleController {
  constructor(private resaleService: ResaleService) {}

  @UseGuards(JwtAuthGuard)
  @Post('list')
  async listForResale(
    @CurrentUser('id') userId: string,
    @Body() body: { ticketId: string; askingPrice: number },
  ) {
    return this.resaleService.listForResale(userId, body.ticketId, body.askingPrice);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancelListing(
    @CurrentUser('id') userId: string,
    @Param('id') resaleId: string,
  ) {
    return this.resaleService.cancelListing(userId, resaleId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/buy')
  async purchaseResale(
    @CurrentUser('id') userId: string,
    @Param('id') resaleId: string,
  ) {
    return this.resaleService.purchaseResale(userId, resaleId);
  }

  @Public()
  @Get('event/:eventId')
  async getEventListings(@Param('eventId') eventId: string) {
    return this.resaleService.getEventListings(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyListings(@CurrentUser('id') userId: string) {
    return this.resaleService.getMyListings(userId);
  }
}
