import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BrandingService } from './branding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('branding')
export class BrandingController {
  constructor(private brandingService: BrandingService) {}

  @Public()
  @Get(':eventId')
  async getBranding(@Param('eventId') eventId: string) {
    return this.brandingService.getBranding(eventId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  @Post(':eventId')
  async upsertBranding(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
    @Body()
    body: {
      primaryColor?: string;
      secondaryColor?: string;
      logoUrl?: string;
      bannerUrl?: string;
      fontFamily?: string;
      customCss?: string;
    },
  ) {
    return this.brandingService.upsertBranding(userId, eventId, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  @Delete(':eventId')
  async removeBranding(
    @CurrentUser('id') userId: string,
    @Param('eventId') eventId: string,
  ) {
    return this.brandingService.removeBranding(userId, eventId);
  }
}
