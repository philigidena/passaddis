import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicApiService } from './public-api.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
export class PublicApiController {
  constructor(private publicApiService: PublicApiService) {}

  @Public()
  @Get('events')
  async listEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.publicApiService.listEvents(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Public()
  @Get('events/:id')
  async getEvent(@Param('id') id: string) {
    return this.publicApiService.getEvent(id);
  }

  @Public()
  @Get('events/:id/availability')
  async getAvailability(@Param('id') id: string) {
    return this.publicApiService.getAvailability(id);
  }
}
