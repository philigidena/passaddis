import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsString, IsNumber, IsOptional, Min, IsNotEmpty, IsEnum } from 'class-validator';

class SendGiftDto {
  @IsString()
  @IsNotEmpty()
  recipientPhone: string;

  @IsNumber()
  @Min(10)
  amount: number;

  @IsString()
  @IsOptional()
  message?: string;
}

class TopUpDto {
  @IsNumber()
  @Min(10)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['STRIPE', 'TELEBIRR', 'CHAPA'])
  paymentMethod?: string;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  async getWallet(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getWalletWithTransactions(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('balance')
  async getBalance(@CurrentUser('id') userId: string) {
    const wallet = await this.walletService.getOrCreateWallet(userId);
    return { balance: wallet.balance };
  }

  @Post('send-gift')
  async sendGift(
    @CurrentUser('id') userId: string,
    @Body() dto: SendGiftDto,
  ) {
    return this.walletService.sendGift(
      userId,
      dto.recipientPhone,
      dto.amount,
      dto.message,
    );
  }

  @Post('top-up')
  async initiateTopUp(
    @CurrentUser('id') userId: string,
    @Body() dto: TopUpDto,
  ) {
    return this.walletService.initiateTopUp(
      userId,
      dto.amount,
      dto.currency || 'ETB',
      dto.paymentMethod || 'STRIPE',
    );
  }
}
