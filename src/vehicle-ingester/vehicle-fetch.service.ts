import { Injectable, Logger } from '@nestjs/common';
import { HttpClient, InjectHttpClient } from '@nestjs/http-client';

@Injectable()
export class VehicleFetchService {
  private readonly logger = new Logger(VehicleFetchService.name);
  private readonly typeURL = '/GetVehicleTypesForMakeId/:makeId';

  constructor(@InjectHttpClient('vehicle-api') private readonly vehicleApi: HttpClient) {}

  async getAllVehicleTypes(makeId: string): Promise<any> {
    const { data } = await this.vehicleApi.get<any>(this.typeURL, {
      params: { makeId },
      query: { format: 'xml' },
    });

    this.logger.log(`Data: ${data}`)
    return data;
  }
}
