import { Controller, Get, Query } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('currency')
export class CurrencyController {
  constructor(private currencyService: CurrencyService) {}

  @Public()
  @Get('rates')
  async getRates() {
    return this.currencyService.getRates();
  }

  @Public()
  @Get('supported')
  async getSupportedCurrencies() {
    return this.currencyService.getSupportedCurrencies();
  }

  @Public()
  @Get('convert')
  async convert(
    @Query('amount') amount: string,
    @Query('from') from: string = 'ETB',
    @Query('to') to: string = 'USD',
  ) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return { error: 'Invalid amount' };
    }

    if (from === 'ETB') {
      const converted = await this.currencyService.convertFromETB(numAmount, to);
      return { from: 'ETB', to, originalAmount: numAmount, convertedAmount: converted };
    } else {
      const etbAmount = await this.currencyService.convertToETB(numAmount, from);
      if (to === 'ETB') {
        return { from, to: 'ETB', originalAmount: numAmount, convertedAmount: etbAmount };
      }
      const converted = await this.currencyService.convertFromETB(etbAmount, to);
      return { from, to, originalAmount: numAmount, convertedAmount: converted };
    }
  }

  @Public()
  @Get('prices')
  async getPricesInAllCurrencies(@Query('amount') amount: string) {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return { error: 'Invalid amount' };
    }
    return this.currencyService.getPriceInAllCurrencies(numAmount);
  }
}
