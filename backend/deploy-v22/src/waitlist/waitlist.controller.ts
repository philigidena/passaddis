import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { JoinWaitlistDto } from './dto/waitlist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('waitlist')
@UseGuards(JwtAuthGuard)
export class WaitlistController {
  constructor(private waitlistService: WaitlistService) {}

  // User: Join waitlist for an event
  @Post('join')
  async joinWaitlist(
    @Body() dto: JoinWaitlistDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.waitlistService.joinWaitlist(dto, userId);
  }

  // User: Leave waitlist
  @Delete('leave/:eventId')
  async leaveWaitlist(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.waitlistService.leaveWaitlist(eventId, userId);
  }

  // User: Check if on waitlist for an event
  @Get('status/:eventId')
  async getWaitlistStatus(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.waitlistService.getWaitlistStatus(eventId, userId);
  }

  // User: Get all waitlist entries
  @Get('my')
  async getMyWaitlists(@CurrentUser('id') userId: string) {
    return this.waitlistService.getUserWaitlists(userId);
  }

  // Organizer: Get waitlist for their event
  @Get('event/:eventId')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getEventWaitlist(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.waitlistService.getEventWaitlist(eventId, userId);
  }
}
