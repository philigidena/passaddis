import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('insurance')
@UseGuards(JwtAuthGuard)
export class InsuranceController {
  constructor(private insuranceService: InsuranceService) {}

  @Post('purchase')
  async purchase(
    @CurrentUser('id') userId: string,
    @Body() body: { orderId: string; premium: number },
  ) {
    return this.insuranceService.purchase(userId, body.orderId, body.premium);
  }

  @Post(':id/claim')
  async submitClaim(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.insuranceService.submitClaim(userId, id, body.reason);
  }

  @Get('order/:orderId')
  async getByOrderId(
    @CurrentUser('id') userId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.insuranceService.getByOrderId(userId, orderId);
  }
}
