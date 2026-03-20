import { Module } from '@nestjs/common';
import { SavedEventsController } from './saved-events.controller';
import { SavedEventsService } from './saved-events.service';

@Module({
  controllers: [SavedEventsController],
  providers: [SavedEventsService],
  exports: [SavedEventsService],
})
export class SavedEventsModule {}
