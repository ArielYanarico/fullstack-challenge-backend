import { Injectable, Logger } from '@nestjs/common';
import {
  HttpClient,
  HttpResponseError,
  InjectHttpClient,
} from '@nestjs/http-client';
import { VehicleMakeBadRequestException } from './exceptions/vehicleMakeBadRequest.exception';
import { VehicleApiUnavailableException } from './exceptions/vehicleApiUnavailable.exception';

@Injectable()
export class VehicleFetchService {
  private readonly logger = new Logger(VehicleFetchService.name);

  private readonly typeURL = '/GetVehicleTypesForMakeId/:makeId';
  private readonly makesURL = '/getallmakes';

  constructor(
    @InjectHttpClient('vehicle-api') private readonly vehicleApi: HttpClient,
  ) {}

  async getVehicleTypesForMakeId(makeId: string): Promise<string> {
    try {
      const { data } = await this.vehicleApi.get<string>(this.typeURL, {
        params: { makeId },
        query: { format: 'xml' },
      });

      this.logger.debug(
        `Vehicle types fetched Successfully for make id: ${makeId}`,
      );
      return data;
    } catch (error) {
      if (error instanceof HttpResponseError && error.status === 400)
        throw new VehicleMakeBadRequestException(this.logger, makeId);

      throw new VehicleApiUnavailableException(
        this.logger,
        error as Error,
        makeId,
      );
    }
  }

  async getAllMakes(): Promise<string> {
    try {
      const { data } = await this.vehicleApi.get<string>(this.makesURL, {
        query: { format: 'xml' },
      });

      this.logger.log('All makes fetched Successfully!');
      return data;
    } catch (error) {
      throw new VehicleApiUnavailableException(this.logger, error as Error);
    }
  }
}
