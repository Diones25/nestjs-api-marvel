import { Module } from '@nestjs/common';
import { MarvelService } from './marvel.service';
import { MarvelController } from './marvel.controller';

@Module({
  providers: [MarvelService],
  controllers: [MarvelController]
})
export class MarvelModule {}
