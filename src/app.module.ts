import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validationSchema } from './config/env.validation.schema'
import { VehicleIngesterModule } from './vehicle-ingester/vehicle-ingester.module';
import { MakesModule } from './makes/makes.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      graphiql: false,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      cache: true,
    }),
    ScheduleModule.forRoot(),
    VehicleIngesterModule,
    MakesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
