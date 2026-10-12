import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { HttpClientModule } from '@nestjs/http-client';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { VehicleIngesterService } from './vehicle-ingester.service';
import { VehicleFetchService } from './vehicle-fetch.service';
import { VehicleParserService } from './vehicle-parser.service';
import { VehicleTypesProcessor } from './vehicle-types.processor';
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
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    BullModule.registerQueueAsync({
      name: 'vehicle-types',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        limiter: {
          max: config.get<number>('INGESTION_RATE_LIMIT_MAX', 20),
          duration: config.get<number>('INGESTION_RATE_LIMIT_DURATION_MS', 1000),
        },
        defaultJobOptions: {
          attempts: config.get<number>('INGESTION_MAX_ATTEMPTS', 3),
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
    }),
  ],
  providers: [
    VehicleIngesterService,
    VehicleFetchService,
    VehicleParserService,
    VehicleTypesProcessor,
  ],
  exports: [VehicleIngesterService]
})

export class VehicleIngesterModule {}
