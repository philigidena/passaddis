import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { PromotersService } from './promoters.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('promoters')
export class PromotersController {
  constructor(private promotersService: PromotersService) {}

  // ===== PUBLIC ENDPOINTS =====

  @Public()
  @Get()
  async listPromoters(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.promotersService.listPromoters({ category, search });
  }

  @Public()
  @Get('event/:eventId')
  async getEventPromoters(@Param('eventId') eventId: string) {
    return this.promotersService.getEventPromoters(eventId);
  }

  // ===== PROMOTER PROFILE ENDPOINTS =====

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getMyProfile(@CurrentUser('id') userId: string) {
    return this.promotersService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async createProfile(
    @CurrentUser('id') userId: string,
    @Body() body: {
      stageName: string;
      bio?: string;
      photo?: string;
      category: string;
      phone?: string;
      email?: string;
      socialLinks?: Record<string, string>;
    },
  ) {
    return this.promotersService.createProfile(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: any,
  ) {
    return this.promotersService.updateProfile(userId, body);
  }

  // ===== PROMOTER ASSIGNMENT RESPONSES =====

  @UseGuards(JwtAuthGuard)
  @Get('assignments')
  async getMyAssignments(@CurrentUser('id') userId: string) {
    return this.promotersService.getMyAssignments(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('assignments/:id/respond')
  async respondToAssignment(
    @CurrentUser('id') userId: string,
    @Param('id') assignmentId: string,
    @Body() body: { accept: boolean },
  ) {
    return this.promotersService.respondToAssignment(userId, assignmentId, body.accept);
  }

  // ===== ORGANIZER ENDPOINTS (assign promoters to events) =====

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @Post('assign/:eventId/:promoterId')
  async assignToEvent(
    @CurrentUser('organizerId') organizerId: string,
    @Param('eventId') eventId: string,
    @Param('promoterId') promoterId: string,
    @Body() body: { role?: string; fee?: number; notes?: string },
  ) {
    return this.promotersService.assignToEvent(organizerId, eventId, promoterId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER', 'ADMIN')
  @Delete('assign/:eventId/:promoterId')
  async removeFromEvent(
    @CurrentUser('organizerId') organizerId: string,
    @Param('eventId') eventId: string,
    @Param('promoterId') promoterId: string,
  ) {
    return this.promotersService.removeFromEvent(organizerId, eventId, promoterId);
  }
}
