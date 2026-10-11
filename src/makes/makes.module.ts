import { Module } from '@nestjs/common';
import { MakesService } from './makes.service';
import { MakesResolver } from './makes.resolver';

@Module({
  providers: [MakesService, MakesResolver]
})
export class MakesModule {}
