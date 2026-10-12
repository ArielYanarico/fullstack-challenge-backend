import { Module } from '@nestjs/common';
import { HttpClientModule } from '@nestjs/http-client';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { VehicleIngesterService } from './vehicle-ingester.service';
import { VehicleFetchService } from './vehicle-fetch.service';
import { VehicleParserService } from './vehicle-parser.service';
import { Make, MakeSchema } from './schemas/make.schema';

@Module({
  imports: [
    HttpClientModule.registerAsync({
      name: 'vehicle-api',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseUrl: config.get<string>('PROVIDER_VEHICLES_URL'),
      }),
    }),
    MongooseModule.forFeature([
      {
        name: Make.name,
        schema: MakeSchema,
      }
    ]),
  ],
  providers: [VehicleIngesterService, VehicleFetchService, VehicleParserService],
  exports: [VehicleIngesterService]
})

export class VehicleIngesterModule {}
