import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
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
  CloneEventDto,
  CreatePricingTierDto,
  UpdatePricingTierDto,
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

  @Post('wallet/payout')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async requestPayout(
    @CurrentUser('id') userId: string,
    @Body() body: { amount: number; method?: string },
  ) {
    return this.organizerService.requestPayout(userId, body.amount, body.method);
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

  @Post('events/:id/clone')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async cloneEvent(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
    @Body() dto: CloneEventDto,
  ) {
    return this.organizerService.cloneEvent(userId, eventId, dto);
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

  // ==================== PRICING TIERS (Early Bird, etc.) ====================

  @Get('events/:eventId/ticket-types/:ticketTypeId/pricing-tiers')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getPricingTiers(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
  ) {
    return this.organizerService.getPricingTiers(userId, eventId, ticketTypeId);
  }

  @Post('events/:eventId/ticket-types/:ticketTypeId/pricing-tiers')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async addPricingTier(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() dto: CreatePricingTierDto,
  ) {
    return this.organizerService.addPricingTier(
      userId,
      eventId,
      ticketTypeId,
      dto,
    );
  }

  @Patch('events/:eventId/ticket-types/:ticketTypeId/pricing-tiers/:tierId')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async updatePricingTier(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
    @Param('tierId') tierId: string,
    @Body() dto: UpdatePricingTierDto,
  ) {
    return this.organizerService.updatePricingTier(
      userId,
      eventId,
      ticketTypeId,
      tierId,
      dto,
    );
  }

  @Delete('events/:eventId/ticket-types/:ticketTypeId/pricing-tiers/:tierId')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async deletePricingTier(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
    @Param('tierId') tierId: string,
  ) {
    return this.organizerService.deletePricingTier(
      userId,
      eventId,
      ticketTypeId,
      tierId,
    );
  }

  // ==================== CSV EXPORTS ====================

  @Get('events/:id/attendees/export')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async exportEventAttendees(
    @CurrentUser('id') userId: string,
    @Param('id') eventId: string,
    @Res() res: Response,
  ) {
    const csv = await this.organizerService.exportEventAttendeesToCsv(
      userId,
      eventId,
    );
    const filename = `attendees-${eventId}-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('reports/sales/export')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async exportSalesReport(
    @CurrentUser('id') userId: string,
    @Query('eventId') eventId: string | undefined,
    @Query('startDate') startDate: string | undefined,
    @Query('endDate') endDate: string | undefined,
    @Res() res: Response,
  ) {
    const csv = await this.organizerService.exportSalesReportToCsv(
      userId,
      eventId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    const filename = `sales-report-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('wallet/transactions/export')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async exportWalletTransactions(
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const csv = await this.organizerService.exportWalletTransactionsToCsv(userId);
    const filename = `wallet-transactions-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  // ============== ATTENDEE MESSAGING ==============

  @Post('events/:id/messages')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async sendMessage(
    @CurrentUser('organizerId') organizerId: string,
    @Param('id') eventId: string,
    @Body() body: { subject: string; body: string; channel?: string },
  ) {
    return this.organizerService.sendMessageToAttendees(
      organizerId,
      eventId,
      body.subject,
      body.body,
      body.channel,
    );
  }

  @Get('events/:id/messages')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getMessages(
    @CurrentUser('organizerId') organizerId: string,
    @Param('id') eventId: string,
  ) {
    return this.organizerService.getEventMessages(organizerId, eventId);
  }

  // ============== RECURRING EVENTS ==============

  @Post('events/:id/recurring')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async createRecurringEvents(
    @CurrentUser('organizerId') organizerId: string,
    @Param('id') eventId: string,
    @Body() body: { recurrenceRule: string; count?: number },
  ) {
    return this.organizerService.createRecurringEvents(
      organizerId,
      eventId,
      body.recurrenceRule,
      body.count,
    );
  }

  // ============== EVENT SESSIONS ==============

  @Get('events/:id/sessions')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getEventSessions(@Param('id') eventId: string) {
    return this.organizerService.getEventSessions(eventId);
  }

  @Post('events/:id/sessions')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async addEventSession(
    @CurrentUser('organizerId') organizerId: string,
    @Param('id') eventId: string,
    @Body() body: { title: string; date: string; endDate?: string; venue?: string; capacity?: number; description?: string },
  ) {
    return this.organizerService.addEventSession(organizerId, eventId, body);
  }

  @Patch('sessions/:sessionId')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async updateEventSession(
    @CurrentUser('organizerId') organizerId: string,
    @Param('sessionId') sessionId: string,
    @Body() body: { title?: string; date?: string; endDate?: string; venue?: string; capacity?: number; description?: string },
  ) {
    return this.organizerService.updateEventSession(organizerId, sessionId, body);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async deleteEventSession(
    @CurrentUser('organizerId') organizerId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.organizerService.deleteEventSession(organizerId, sessionId);
  }

  // ============== PRESALE CODES ==============

  @Post('events/:id/presale-codes')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async createPresaleCodes(
    @CurrentUser('organizerId') organizerId: string,
    @Param('id') eventId: string,
    @Body() body: { codes: { code: string; maxUses: number; validFrom: string; validUntil: string }[] },
  ) {
    return this.organizerService.createPresaleCodes(organizerId, eventId, body.codes);
  }

  @Get('events/:id/presale-codes/validate')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async validatePresaleCode(
    @Param('id') eventId: string,
    @Query('code') code: string,
  ) {
    return this.organizerService.validatePresaleCode(eventId, code);
  }

  // ============== LIVE CHECK-IN ==============

  @Get('events/:id/checkin-stats')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async getCheckInStats(
    @CurrentUser('organizerId') organizerId: string,
    @Param('id') eventId: string,
  ) {
    return this.organizerService.getCheckInStats(organizerId, eventId);
  }

  // ============== FEE ABSORPTION ==============

  @Patch('events/:id/fee-absorption')
  @UseGuards(RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  async toggleFeeAbsorption(
    @CurrentUser('organizerId') organizerId: string,
    @Param('id') eventId: string,
    @Body() body: { absorb: boolean },
  ) {
    return this.organizerService.toggleFeeAbsorption(organizerId, eventId, body.absorb);
  }
}
