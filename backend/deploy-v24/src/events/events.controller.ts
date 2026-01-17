import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  UpdateEventDto,
  EventQueryDto,
} from './dto/events.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAll(query);
  }

  @Public()
  @Get('featured')
  async getFeatured() {
    return this.eventsService.getFeatured();
  }

  @Public()
  @Get('categories')
  async getCategories() {
    return this.eventsService.getCategories();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @CurrentUser('organizerId') organizerId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(organizerId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('organizerId') organizerId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, organizerId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('organizer/my-events')
  async getMyEvents(@CurrentUser('organizerId') organizerId: string) {
    return this.eventsService.getOrganizerEvents(organizerId);
  }
}
