import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { OrganizerService } from './organizer.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateOrganizerProfileDto,
  UpdateOrganizerProfileDto,
  CreateEventDto,
  UpdateEventDto,
  CreateTicketTypeDto,
} from './dto/organizer.dto';

@Controller('organizer')
@UseGuards(JwtAuthGuard)
export class OrganizerController {
  constructor(private organizerService: OrganizerService) {}

  // ==================== PROFILE ====================

  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.organizerService.getProfile(userId);
  }

  @Post('profile')
  async createProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrganizerProfileDto,
  ) {
    return this.organizerService.createProfile(userId, dto);
  }

  @Patch('profile')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateOrganizerProfileDto,
  ) {
    return this.organizerService.updateProfile(userId, dto);
  }

  // ==================== DASHBOARD ====================

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getDashboard(@CurrentUser('id') userId: string) {
    return this.organizerService.getDashboard(userId);
  }

  // ==================== WALLET ====================

  @Get('wallet')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getWallet(@CurrentUser('id') userId: string) {
    return this.organizerService.getWallet(userId);
  }

  @Get('wallet/transactions')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getWalletTransactions(@CurrentUser('id') userId: string) {
    return this.organizerService.getWalletTransactions(userId);
  }

  @Get('wallet/settlements')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getSettlements(@CurrentUser('id') userId: string) {
    return this.organizerService.getSettlements(userId);
  }

  // ==================== EVENTS ====================

  @Get('events')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getMyEvents(@CurrentUser('id') userId: string) {
    return this.organizerService.getMyEvents(userId);
  }

  @Get('events/:id')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getEvent(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
  ) {
    return this.organizerService.getEvent(userId, eventId);
  }

  @Post('events')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async createEvent(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.organizerService.createEvent(userId, dto);
  }

  @Patch('events/:id')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async updateEvent(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
    @Body() dto: UpdateEventDto,
  ) {
    return this.organizerService.updateEvent(userId, eventId, dto);
  }

  @Post('events/:id/submit')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async submitForApproval(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
  ) {
    return this.organizerService.submitEventForApproval(userId, eventId);
  }

  @Post('events/:id/publish')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async publishEvent(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
  ) {
    return this.organizerService.publishEvent(userId, eventId);
  }

  @Post('events/:id/cancel')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async cancelEvent(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
  ) {
    return this.organizerService.cancelEvent(userId, eventId);
  }

  // ==================== ATTENDEES ====================

  @Get('events/:id/attendees')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getEventAttendees(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
  ) {
    return this.organizerService.getEventAttendees(userId, eventId);
  }

  // ==================== TICKET TYPES ====================

  @Post('events/:id/ticket-types')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async addTicketType(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
    @Body() dto: CreateTicketTypeDto,
  ) {
    return this.organizerService.addTicketType(userId, eventId, dto);
  }

  @Patch('events/:eventId/ticket-types/:ticketTypeId')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async updateTicketType(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() dto: Partial<CreateTicketTypeDto>,
  ) {
    return this.organizerService.updateTicketType(
      userId,
      eventId,
      ticketTypeId,
      dto,
    );
  }

  @Delete('events/:eventId/ticket-types/:ticketTypeId')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async deleteTicketType(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
  ) {
    return this.organizerService.deleteTicketType(
      userId,
      eventId,
      ticketTypeId,
    );
  }
}
