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
      throw new BadRequestException('As chaves da API da Marvel não estão configuradas');
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
            this.logger.error(`Falha na solicitação da API da Marvel: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Falha ao buscar dados da API da Marvel: ${error.message}`);
          })
        )
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Error in Marvel API request to ${url}: ${error.message}`);
      throw new InternalServerErrorException(`Serviço de API da Marvel indisponível: ${error.message}`);
    }
  }

  async getComics(limit: number, offset: number): Promise<any> {
    return this.makeMarvelApiRequest('/comics', { limit, offset });
  }

  async getComicById(comicId: number): Promise<any> {
    return this.makeMarvelApiRequest(`/comics/${comicId}`);
  }

  async getCreators(limit: number, offset: number): Promise<any> {
    return this.makeMarvelApiRequest('/creators', { limit, offset });
  }

  async getCreatorsId(comicId: number): Promise<any> {
    return this.makeMarvelApiRequest(`/creators/${comicId}`);
  }

  async getSeries(limit: number, offset: number): Promise<any> {
    return this.makeMarvelApiRequest('/series', { limit, offset });
  }

  async getSeriesId(comicId: number): Promise<any> {
    return this.makeMarvelApiRequest(`/series/${comicId}`);
  }
}