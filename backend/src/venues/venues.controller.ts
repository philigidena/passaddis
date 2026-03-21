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
import { VenuesService } from './venues.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('venues')
export class VenuesController {
  constructor(private venuesService: VenuesService) {}

  @Public()
  @Get()
  async findAll() {
    return this.venuesService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.venuesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  async create(
    @Body()
    body: {
      name: string;
      address: string;
      city?: string;
      capacity?: number;
      description?: string;
      imageUrl?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    return this.venuesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      address?: string;
      city?: string;
      capacity?: number;
      description?: string;
      imageUrl?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    return this.venuesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.venuesService.remove(id);
  }
}
