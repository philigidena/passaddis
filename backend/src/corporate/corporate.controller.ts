import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CorporateService } from './corporate.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('corporate')
@UseGuards(JwtAuthGuard)
export class CorporateController {
  constructor(private corporateService: CorporateService) {}

  @Post('register')
  async register(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      companyName: string;
      tinNumber: string;
      contactName: string;
      contactEmail: string;
      contactPhone: string;
    },
  ) {
    return this.corporateService.register(userId, body);
  }

  @Get('account')
  async getAccount(@CurrentUser('id') userId: string) {
    return this.corporateService.getAccount(userId);
  }

  @Post('invoices')
  async createInvoice(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string },
  ) {
    return this.corporateService.createInvoice(userId, body.orderId);
  }

  @Get('invoices')
  async listInvoices(@CurrentUser('id') userId: string) {
    return this.corporateService.getInvoices(userId);
  }

  @Get('invoices/:id')
  async getInvoice(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.corporateService.getInvoice(userId, id);
  }
}
