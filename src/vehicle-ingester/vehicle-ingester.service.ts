import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { VehicleFetchService } from './vehicle-fetch.service';
import { VehicleParserService } from './vehicle-parser.service';
import { VehicleType } from './schemas/vehicleType.schema';


@Injectable()
export class VehicleIngesterService {
  private readonly logger = new Logger(VehicleFetchService.name);

  constructor(
    private readonly vehicleFetchService: VehicleFetchService,
    private readonly vehicleParseService: VehicleParserService,

    @InjectModel(VehicleType.name)
    private vehicleTypeModel: Model<VehicleType>
  ) { }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Starting up makes and vehicle types...');
    this.ingestVehicleTypes();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron(): Promise<void> {
    this.logger.log('Scheduled ingestion of makes and vehicle types data...');
    this.ingestVehicleTypes();
  }

  private async ingestVehicleTypes(): Promise<void> {
    const vehicleTypesXml = await this.vehicleFetchService.getVehicleTypesForMakeId('440');
    //this.vehicleFetchService.getAllMakes();

    const vehicleTypes = this.vehicleParseService.parseVehicleType(vehicleTypesXml);
    this.vehicleTypeModel.deleteMany({});
    this.vehicleTypeModel.insertMany(vehicleTypes);
  }

  private async ingestMakes(): Promise<void> {
    const makesXml = await this.vehicleFetchService.getAllMakes();
  }
}
