import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { VehicleFetchService } from './vehicle-fetch.service';

@Injectable()
export class VehicleIngesterService {

  constructor(
    private readonly vehicleFetchService: VehicleFetchService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  ingestVehicleMakes() {
    this.vehicleFetchService.getVehicleTypesForMakeId('440');
    this.vehicleFetchService.getAllMakes();
  }
}
