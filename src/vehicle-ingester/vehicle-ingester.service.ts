import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { VehicleFetchService } from './vehicle-fetch.service';
import { VehicleParserService } from './vehicle-parser.service';

@Injectable()
export class VehicleIngesterService {
  private readonly logger = new Logger(VehicleFetchService.name);

  constructor(
    private readonly vehicleFetchService: VehicleFetchService,
    private readonly vehicleParseService: VehicleParserService,
  ) { }

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('Starting up makes and vehicle types...');
    this.ingestVehicleData();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron(): Promise<void> {
    this.logger.log('Scheduled ingestion of makes and vehicle types data...');
    this.ingestVehicleData();
  }

  private async ingestVehicleData(): Promise<void> {
    const vehicleTypesXml = await this.vehicleFetchService.getVehicleTypesForMakeId('440');
    //this.vehicleFetchService.getAllMakes();

    const vehicleTypes = this.vehicleParseService.parseVehicleType(vehicleTypesXml);
  }
}
