import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { VehicleFetchService } from './vehicle-fetch.service';

@Injectable()
export class VehicleIngesterService {

  constructor(
    private readonly vehicleFetchService: VehicleFetchService,
  ) {}

  @Cron('5 * * * * *')
  ingestVehicleMakes() {
    this.vehicleFetchService.getAllVehicleTypes('440')
  }
}
