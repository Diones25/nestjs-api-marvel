import { Module } from '@nestjs/common';
import { MarvelService } from './marvel.service';
import { MarvelController } from './marvel.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule,
    ConfigModule.forRoot(),
  ],
  providers: [MarvelService],
  controllers: [MarvelController]
})
export class MarvelModule {}
