import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ExchangeRates {
  base: string; // ETB
  rates: Record<string, number>; // e.g. { USD: 0.017, EUR: 0.016 }
  updatedAt: Date;
}

// Supported currencies for diaspora users
export const SUPPORTED_CURRENCIES = ['ETB', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SEK', 'NOR'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

const CURRENCY_SYMBOLS: Record<string, string> = {
  ETB: 'ETB',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  SEK: 'kr',
  NOR: 'kr',
};

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private cachedRates: ExchangeRates | null = null;
  private readonly cacheDuration = 60 * 60 * 1000; // 1 hour

  // Fallback rates (approximate, updated periodically)
  // ETB to other currencies
  private readonly fallbackRates: Record<string, number> = {
    ETB: 1,
    USD: 0.017,   // ~58 ETB per USD
    EUR: 0.016,   // ~62 ETB per EUR
    GBP: 0.014,   // ~71 ETB per GBP
    CAD: 0.023,   // ~43 ETB per CAD
    AUD: 0.026,   // ~38 ETB per AUD
    SEK: 0.18,    // ~5.5 ETB per SEK
    NOR: 0.18,    // ~5.5 ETB per NOK
  };

  constructor(private configService: ConfigService) {}

  /**
   * Get current exchange rates (ETB as base)
   */
  async getRates(): Promise<ExchangeRates> {
    if (this.cachedRates && Date.now() - this.cachedRates.updatedAt.getTime() < this.cacheDuration) {
      return this.cachedRates;
    }

    try {
      await this.fetchRates();
    } catch (error) {
      this.logger.warn(`Failed to fetch exchange rates, using fallback: ${error.message}`);
    }

    if (!this.cachedRates) {
      this.cachedRates = {
        base: 'ETB',
        rates: { ...this.fallbackRates },
        updatedAt: new Date(),
      };
    }

    return this.cachedRates;
  }

  /**
   * Fetch live rates from an exchange rate API
   */
  private async fetchRates(): Promise<void> {
    const apiKey = this.configService.get<string>('EXCHANGE_RATE_API_KEY');

    if (!apiKey) {
      this.logger.debug('No EXCHANGE_RATE_API_KEY configured, using fallback rates');
      return;
    }

    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/ETB`,
      );
      const data = await response.json();

      if (data.result === 'success') {
        const rates: Record<string, number> = { ETB: 1 };
        for (const currency of SUPPORTED_CURRENCIES) {
          if (data.conversion_rates[currency]) {
            rates[currency] = data.conversion_rates[currency];
          }
        }

        this.cachedRates = {
          base: 'ETB',
          rates,
          updatedAt: new Date(),
        };
        this.logger.log('Exchange rates updated successfully');
      }
    } catch (error) {
      this.logger.error(`Exchange rate fetch failed: ${error.message}`);
    }
  }

  /**
   * Convert ETB amount to target currency
   */
  async convertFromETB(amountETB: number, targetCurrency: string): Promise<number> {
    if (targetCurrency === 'ETB') return amountETB;

    const rates = await this.getRates();
    const rate = rates.rates[targetCurrency];
    if (!rate) {
      this.logger.warn(`No rate for ${targetCurrency}, returning ETB amount`);
      return amountETB;
    }

    return Math.round(amountETB * rate * 100) / 100;
  }

  /**
   * Convert from a foreign currency to ETB
   */
  async convertToETB(amount: number, fromCurrency: string): Promise<number> {
    if (fromCurrency === 'ETB') return amount;

    const rates = await this.getRates();
    const rate = rates.rates[fromCurrency];
    if (!rate || rate === 0) {
      this.logger.warn(`No rate for ${fromCurrency}, returning original amount`);
      return amount;
    }

    return Math.round((amount / rate) * 100) / 100;
  }

  /**
   * Get price in multiple currencies
   */
  async getPriceInAllCurrencies(amountETB: number): Promise<Record<string, { amount: number; symbol: string; formatted: string }>> {
    const rates = await this.getRates();
    const result: Record<string, { amount: number; symbol: string; formatted: string }> = {};

    for (const currency of SUPPORTED_CURRENCIES) {
      const rate = rates.rates[currency] || 0;
      const converted = currency === 'ETB' ? amountETB : Math.round(amountETB * rate * 100) / 100;
      const symbol = CURRENCY_SYMBOLS[currency] || currency;

      result[currency] = {
        amount: converted,
        symbol,
        formatted: currency === 'ETB'
          ? `${converted.toLocaleString()} ETB`
          : `${symbol}${converted.toFixed(2)}`,
      };
    }

    return result;
  }

  /**
   * Get supported currencies list
   */
  getSupportedCurrencies() {
    return SUPPORTED_CURRENCIES.map((code) => ({
      code,
      symbol: CURRENCY_SYMBOLS[code] || code,
      name: this.getCurrencyName(code),
    }));
  }

  private getCurrencyName(code: string): string {
    const names: Record<string, string> = {
      ETB: 'Ethiopian Birr',
      USD: 'US Dollar',
      EUR: 'Euro',
      GBP: 'British Pound',
      CAD: 'Canadian Dollar',
      AUD: 'Australian Dollar',
      SEK: 'Swedish Krona',
      NOR: 'Norwegian Krone',
    };
    return names[code] || code;
  }
}
