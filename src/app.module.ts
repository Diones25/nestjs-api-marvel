import { Module } from '@nestjs/common';
import { MarvelModule } from './marvel/marvel.module';

@Module({
  imports: [MarvelModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
