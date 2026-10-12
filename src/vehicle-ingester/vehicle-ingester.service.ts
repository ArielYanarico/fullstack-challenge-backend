import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { VehicleFetchService } from './vehicle-fetch.service';

@Injectable()
export class VehicleIngesterService {
  private readonly logger = new Logger(VehicleFetchService.name);

  constructor(
    private readonly vehicleFetchService: VehicleFetchService,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Starting up makes and vehicle types...');
    this.ingestVehicleMakes();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Scheduled ingestion of makes and vehicle types data...');
    this.ingestVehicleMakes();
  }

  private async ingestVehicleMakes() {
    this.vehicleFetchService.getVehicleTypesForMakeId('440');
    this.vehicleFetchService.getAllMakes();
  }
}
