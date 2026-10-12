import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MakesService } from './makes.service';
import { MakesResolver } from './makes.resolver';
import { Make, MakeSchema } from '../vehicle-ingester/schemas/make.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Make.name,
        schema: MakeSchema,
      },
    ]),
  ],
  providers: [MakesService, MakesResolver],
  exports: [MakesService],
})
export class MakesModule {}
