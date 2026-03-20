import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SavedEventsService } from './saved-events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('saved-events')
@UseGuards(JwtAuthGuard)
export class SavedEventsController {
  constructor(private savedEventsService: SavedEventsService) {}

  @Get()
  async getSavedEvents(@CurrentUser('id') userId: string) {
    return this.savedEventsService.getSavedEvents(userId);
  }

  @Get('ids')
  async getSavedEventIds(@CurrentUser('id') userId: string) {
    return this.savedEventsService.getSavedEventIds(userId);
  }

  @Get(':eventId/check')
  async isEventSaved(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.savedEventsService.isEventSaved(userId, eventId);
  }

  @Post(':eventId')
  async saveEvent(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.savedEventsService.saveEvent(userId, eventId);
  }

  @Delete(':eventId')
  async unsaveEvent(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.savedEventsService.unsaveEvent(userId, eventId);
  }
}
