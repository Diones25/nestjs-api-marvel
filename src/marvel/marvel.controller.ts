import { Controller, Get, Query } from '@nestjs/common';
import { MarvelService } from './marvel.service';

@Controller('marvel')
export class MarvelController {
  constructor(private readonly marvelService: MarvelService) { }

  @Get()
  async getComics(@Query('limit') limit: number, @Query('offset') offset: number) {
    return this.marvelService.getComics(limit, offset);
  }
}
