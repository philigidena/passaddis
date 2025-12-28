import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PromoService } from './promo.service';
import {
  CreatePromoCodeDto,
  UpdatePromoCodeDto,
  ValidatePromoCodeDto,
} from './dto/promo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('promo')
@UseGuards(JwtAuthGuard)
export class PromoController {
  constructor(private promoService: PromoService) {}

  // ============== ADMIN ENDPOINTS ==============

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async createPromoCode(@Body() dto: CreatePromoCodeDto) {
    return this.promoService.createPromoCode(dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async listPromoCodes(
    @Query('isActive') isActive?: string,
    @Query('eventId') eventId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.promoService.listPromoCodes({
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      eventId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getPromoCode(@Param('id') id: string) {
    return this.promoService.getPromoCode(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async updatePromoCode(
    @Param('id') id: string,
    @Body() dto: UpdatePromoCodeDto,
  ) {
    return this.promoService.updatePromoCode(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async deletePromoCode(@Param('id') id: string) {
    await this.promoService.deletePromoCode(id);
    return { message: 'Promo code deleted successfully' };
  }

  // ============== USER ENDPOINTS ==============

  @Post('validate')
  async validatePromoCode(
    @Body() dto: ValidatePromoCodeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.promoService.validatePromoCode(dto, userId);
  }
}
