import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { VehicleFetchService } from './vehicle-fetch.service';
import { VehicleParserService } from './vehicle-parser.service';
import { Make } from './schemas/make.schema';


@Injectable()
export class VehicleIngesterService implements OnApplicationBootstrap {
  private readonly logger = new Logger(VehicleIngesterService.name);

  constructor(
    private readonly vehicleFetchService: VehicleFetchService,
    private readonly vehicleParseService: VehicleParserService,

    @InjectModel(Make.name)
    private makeModel: Model<Make>,
  ) { }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Starting up makes and vehicle types...');
    void this.ingestAll();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron(): Promise<void> {
    this.logger.log('Scheduled ingestion of makes and vehicle types data...');
    await this.ingestAll();
  }

  private async ingestAll(): Promise<void> {
    try {
      await this.ingestMakes();
      await this.ingestVehicleTypes('440');
    } catch (error) {
      this.logger.error({ err: error }, 'Ingestion failed');
    }
  }

  private async ingestVehicleTypes(makeId: string): Promise<void> {
    const vehicleTypesXml = await this.vehicleFetchService.getVehicleTypesForMakeId(makeId);
    const vehicleTypes = this.vehicleParseService.parseVehicleType(vehicleTypesXml);

    if (vehicleTypes.length === 0) {
      this.logger.warn('No vehicle types to store, keeping previus data');
      return;
    }

    await this.makeModel.updateOne({ makeId }, { $set: { vehicleTypes } });
    this.logger.log(`Vehicle types stored for make ${makeId}: ${vehicleTypes.length}`);
  }

  private async ingestMakes(): Promise<void> {
    const makesXml = await this.vehicleFetchService.getAllMakes();
    const makeTypes = this.vehicleParseService.parseMakes(makesXml);

    if (makeTypes.length === 0) {
      this.logger.warn('No makes to store, keeping previous data');
      return;
    }

    await this.makeModel.deleteMany({});
    await this.makeModel.insertMany(makeTypes);
    this.logger.log(`Makes stored: ${makeTypes.length}`);
  }
}
