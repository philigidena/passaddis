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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
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
  @Get('support/whatsapp')
  async getWhatsAppSupport(
    @Query('subject') subject?: string,
    @Query('orderId') orderId?: string,
  ) {
    return this.eventsService.getWhatsAppSupportLink(subject, orderId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Public()
  @Get(':id/share/whatsapp')
  async getWhatsAppShareLink(@Param('id') id: string) {
    return this.eventsService.getWhatsAppShareLink(id);
  }

  @Public()
  @Get('ticket-types/:ticketTypeId/price')
  async getTicketTypePrice(@Param('ticketTypeId') ticketTypeId: string) {
    return this.eventsService.getTicketTypePrice(ticketTypeId);
  }

  /**
   * Create a new event
   * Only ORGANIZER and ADMIN roles can create events
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @Post()
  async create(
    @CurrentUser('organizerId') organizerId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.create(organizerId, dto);
  }

  /**
   * Update an existing event
   * Only ORGANIZER and ADMIN roles can update events
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('organizerId') organizerId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, organizerId, dto);
  }

  /**
   * Get organizer's events
   * Only ORGANIZER and ADMIN roles can access
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @Get('organizer/my-events')
  async getMyEvents(@CurrentUser('organizerId') organizerId: string) {
    return this.eventsService.getOrganizerEvents(organizerId);
  }
}
