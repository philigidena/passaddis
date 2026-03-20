import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ratings')
export class RatingsController {
  constructor(private ratingsService: RatingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':eventId')
  async rateEvent(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
    @Body() body: { rating: number; review?: string; isAnonymous?: boolean },
  ) {
    return this.ratingsService.rateEvent(
      userId,
      eventId,
      body.rating,
      body.review,
      body.isAnonymous,
    );
  }

  @Public()
  @Get(':eventId')
  async getEventRatings(
    @Param('eventId') eventId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ratingsService.getEventRatings(
      eventId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':eventId/my')
  async getMyRating(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.ratingsService.getUserRating(userId, eventId);
  }
}
