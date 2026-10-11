import { Module } from '@nestjs/common';
import { HttpClientModule } from '@nestjs/http-client';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { VehicleIngesterService } from './vehicle-ingester.service';
import { VehicleFetchService } from './vehicle-fetch.service';
import { VehicleParserService } from './vehicle-parser.service';

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
  ],
  providers: [VehicleIngesterService, VehicleFetchService, VehicleParserService]
})

export class VehicleIngesterModule {}
