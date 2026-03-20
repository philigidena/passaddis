import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('follows')
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':organizerId')
  async follow(
    @CurrentUser('id') userId: string,
    @Param('organizerId') organizerId: string,
  ) {
    return this.followsService.follow(userId, organizerId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':organizerId')
  async unfollow(
    @CurrentUser('id') userId: string,
    @Param('organizerId') organizerId: string,
  ) {
    return this.followsService.unfollow(userId, organizerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':organizerId/check')
  async isFollowing(
    @CurrentUser('id') userId: string,
    @Param('organizerId') organizerId: string,
  ) {
    return this.followsService.isFollowing(userId, organizerId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getFollowing(@CurrentUser('id') userId: string) {
    return this.followsService.getFollowing(userId);
  }

  @Public()
  @Get(':organizerId/count')
  async getFollowerCount(@Param('organizerId') organizerId: string) {
    return this.followsService.getFollowerCount(organizerId);
  }

  @Public()
  @Get(':organizerId/profile')
  async getPublicProfile(@Param('organizerId') organizerId: string) {
    return this.followsService.getOrganizerPublicProfile(organizerId);
  }
}
