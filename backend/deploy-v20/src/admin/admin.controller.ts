import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  UpdateUserRoleDto,
  UserQueryDto,
  ApproveEventDto,
  RejectEventDto,
  EventQueryDto,
  VerifyOrganizerDto,
  OrganizerQueryDto,
  CreateShopItemDto,
  UpdateShopItemDto,
  CreatePickupLocationDto,
  UpdatePickupLocationDto,
} from './dto/admin.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ==================== DASHBOARD ====================

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // ==================== USER MANAGEMENT ====================

  @Get('users')
  async getUsers(@Query() query: UserQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.updateUserRole(id, dto, adminId);
  }

  // ==================== EVENT APPROVAL ====================

  @Get('events')
  async getAllEvents(@Query() query: EventQueryDto) {
    return this.adminService.getAllEvents(query);
  }

  @Get('events/pending')
  async getPendingEvents(@Query() query: EventQueryDto) {
    return this.adminService.getPendingEvents(query);
  }

  @Post('events/:id/approve')
  async approveEvent(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: ApproveEventDto,
  ) {
    return this.adminService.approveEvent(id, adminId, dto);
  }

  @Post('events/:id/reject')
  async rejectEvent(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: RejectEventDto,
  ) {
    return this.adminService.rejectEvent(id, adminId, dto);
  }

  @Patch('events/:id/featured')
  async toggleFeatured(@Param('id') id: string) {
    return this.adminService.toggleEventFeatured(id);
  }

  // ==================== ORGANIZER MANAGEMENT ====================

  @Get('organizers')
  async getOrganizers(@Query() query: OrganizerQueryDto) {
    return this.adminService.getOrganizers(query);
  }

  @Post('organizers/:id/verify')
  async verifyOrganizer(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: VerifyOrganizerDto,
  ) {
    return this.adminService.verifyOrganizer(id, adminId, dto);
  }

  @Post('organizers/:id/suspend')
  async suspendOrganizer(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.suspendOrganizer(id, reason);
  }

  // ==================== SHOP ITEM MANAGEMENT ====================

  @Get('shop/items')
  async getShopItems() {
    return this.adminService.getShopItems();
  }

  @Post('shop/items')
  async createShopItem(@Body() dto: CreateShopItemDto) {
    return this.adminService.createShopItem(dto);
  }

  @Patch('shop/items/:id')
  async updateShopItem(@Param('id') id: string, @Body() dto: UpdateShopItemDto) {
    return this.adminService.updateShopItem(id, dto);
  }

  @Delete('shop/items/:id')
  async deleteShopItem(@Param('id') id: string) {
    return this.adminService.deleteShopItem(id);
  }

  // ==================== PICKUP LOCATION MANAGEMENT ====================

  @Get('pickup-locations')
  async getPickupLocations() {
    return this.adminService.getPickupLocations();
  }

  @Post('pickup-locations')
  async createPickupLocation(@Body() dto: CreatePickupLocationDto) {
    return this.adminService.createPickupLocation(dto);
  }

  @Patch('pickup-locations/:id')
  async updatePickupLocation(
    @Param('id') id: string,
    @Body() dto: UpdatePickupLocationDto,
  ) {
    return this.adminService.updatePickupLocation(id, dto);
  }

  @Delete('pickup-locations/:id')
  async deletePickupLocation(@Param('id') id: string) {
    return this.adminService.deletePickupLocation(id);
  }
}
