import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('referrals')
export class ReferralsController {
  constructor(private referralsService: ReferralsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createReferral(
    @CurrentUser('id') userId: string,
    @Query('eventId') eventId?: string,
  ) {
    return this.referralsService.getOrCreateReferral(userId, eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyReferrals(@CurrentUser('id') userId: string) {
    return this.referralsService.getUserReferrals(userId);
  }

  @Public()
  @Get('track/:code')
  async trackClick(@Param('code') code: string) {
    return this.referralsService.trackClick(code);
  }
}
