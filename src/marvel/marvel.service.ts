import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MarvelService {
  private readonly logger = new Logger(MarvelService.name);
  private readonly apiBaseUrl = 'https://gateway.marvel.com/v1/public';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  private generateHash(timestamp: string): string {
    const privateKey = this.configService.get('MARVEL_PRIVATE_KEY');
    const publicKey = this.configService.get('MARVEL_PUBLIC_KEY');

    if (!privateKey || !publicKey) {
      throw new BadRequestException('Marvel API keys are not configured');
    }

    return crypto
      .createHash('md5')
      .update(timestamp + privateKey + publicKey)
      .digest('hex');
  }

  private getAuthParams(): {
    ts: string;
    apikey: string;
    hash: string;
  } {
    const ts = new Date().getTime().toString();
    const apikey = this.configService.get('MARVEL_PUBLIC_KEY');
    const hash = this.generateHash(ts);

    return { ts, apikey, hash };
  }

  async makeMarvelApiRequest(endpoint: string, params: Record<string, any> = {}) {
    const authParams = this.getAuthParams();
    const url = `${this.apiBaseUrl}${endpoint}`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: {
            ...authParams,
            ...params,
          },
          timeout: 10000, // 10 segundos de timeout
        }).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Marvel API request failed: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Failed to fetch data from Marvel API: ${error.message}`);
          })
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error in Marvel API request to ${url}: ${error.message}`);
      throw new InternalServerErrorException(`Marvel API service unavailable: ${error.message}`);
    }
  }

  async getComics(limit: number, offset: number): Promise<any> {
    return this.makeMarvelApiRequest('/comics', { limit, offset });
  }

  async getComicById(comicId: number): Promise<any> {
    return this.makeMarvelApiRequest(`/comics/${comicId}`);
  }
}