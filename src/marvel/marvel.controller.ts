import { Controller, Get, Param, Query } from '@nestjs/common';
import { MarvelService } from './marvel.service';

@Controller('marvel')
export class MarvelController {
  constructor(private readonly marvelService: MarvelService) { }

  @Get('comics')
  async getComics(@Query('limit') limit: number, @Query('offset') offset: number) {
    return this.marvelService.getComics(limit, offset);
  }

  @Get('comics/:id')
  async getComicById(@Param('id') id: number) {
    return this.marvelService.getComicById(id);
  }

  @Get('creators')
  async getCreators(@Query('limit') limit: number, @Query('offset') offset: number) {
    return this.marvelService.getCreators(limit, offset);
  }

  @Get('creators/:id')
  async getCreatorsId(@Param('id') id: number) {
    return this.marvelService.getCreatorsId(id);
  }

  @Get('series')
  async getSeries(@Query('limit') limit: number, @Query('offset') offset: number) {
    return this.marvelService.getSeries(limit, offset);
  }

  @Get('series/:id')
  async getSeriesId(@Param('id') id: number) {
    return this.marvelService.getSeriesId(id);
  }
}
