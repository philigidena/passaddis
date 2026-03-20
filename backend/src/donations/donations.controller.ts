import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { DonationsService } from './donations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('donations')
export class DonationsController {
  constructor(private donationsService: DonationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':eventId')
  async donate(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
    @Body() body: { amount: number; message?: string; isAnonymous?: boolean },
  ) {
    return this.donationsService.donate(
      userId,
      eventId,
      body.amount,
      body.message,
      body.isAnonymous,
    );
  }

  @Public()
  @Get(':eventId')
  async getEventDonations(@Param('eventId') eventId: string) {
    return this.donationsService.getEventDonations(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyDonations(@CurrentUser('id') userId: string) {
    return this.donationsService.getMyDonations(userId);
  }
}
