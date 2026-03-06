import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

interface PriceData {
  stxUsd: number;
  stxBtc: number;
  lastUpdated: number;
}

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);
  private readonly CACHE_KEY = 'stx_price';
  private readonly CACHE_TTL = 60; // 1 minute

  constructor(private readonly redisService: RedisService) {}

  async getStxPrice(): Promise<PriceData> {
    try {
      // Check cache first
      const cached = await this.redisService.get(this.CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from CoinGecko API
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd,btc',
        { signal: AbortSignal.timeout(5000) }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch price data');
      }

      const data = await response.json();
      const priceData: PriceData = {
        stxUsd: data.blockstack?.usd || 0,
        stxBtc: data.blockstack?.btc || 0,
        lastUpdated: Date.now(),
      };

      // Cache the result
      await this.redisService.set(
        this.CACHE_KEY,
        JSON.stringify(priceData),
        this.CACHE_TTL,
      );

      return priceData;
    } catch (error) {
      this.logger.error('Error fetching STX price', error);
      // Return fallback values
      return {
        stxUsd: 0,
        stxBtc: 0,
        lastUpdated: Date.now(),
      };
    }
  }

  async convertMicroStxToUsd(microStx: number): Promise<string> {
    const price = await this.getStxPrice();
    const stx = microStx / 1000000;
    const usd = stx * price.stxUsd;
    return usd.toFixed(4);
  }

  async convertMicroStxToBtc(microStx: number): Promise<number> {
    const price = await this.getStxPrice();
    const stx = microStx / 1000000;
    return stx * price.stxBtc;
  }
}
