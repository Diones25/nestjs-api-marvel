import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs'
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ParamsType } from './types/params';

@Injectable()
export class MarvelService {
  private readonly baseUrl: string = 'http://gateway.marvel.com/v1/public';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) { }
  
  private generateHash(timestamp: string): string {
    const privateKey = this.configService.get("MARVEL_PRIVATE_KEY");
    const publicKey = this.configService.get("MARVEL_PUBLIC_KEY");

    return crypto
      .createHash('md5')
      .update(timestamp + privateKey + publicKey)
      .digest('hex');
  }

  private getAuthParams(): ParamsType {
    const ts = new Date().getTime().toString();
    const apikey = this.configService.get("MARVEL_PUBLIC_KEY");
    const hash = this.generateHash(ts);

    return {
      ts,
      apikey,
      hash
    }
  }

  async getComics(limint: number, offset: number) {
    const authParams = this.getAuthParams();
    const url = `${this.baseUrl}/comics`;

    const { data } = await firstValueFrom(
      this.httpService.get(url, {
        params: {
          ...authParams,
          limit: limint,
          offset
        }
      })
    );

    return data;
  }
}
