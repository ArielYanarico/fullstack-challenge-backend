import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { VehicleFetchService } from './vehicle-fetch.service';
import { VehicleParserService } from './vehicle-parser.service';
import { ConfigService } from '@nestjs/config';
import { Make } from './schemas/make.schema';

export interface VehicleTypeJobData {
  makeId: string;
}

@Processor('vehicle-types')
export class VehicleTypesProcessor extends WorkerHost {
  private readonly logger = new Logger(VehicleTypesProcessor.name);

  constructor(
    private readonly vehicleFetchService: VehicleFetchService,
    private readonly vehicleParserService: VehicleParserService,
    private readonly configService: ConfigService,
    @InjectModel(Make.name)
    private readonly makeModel: Model<Make>,
  ) {
    super();
  }

  async process(job: Job<VehicleTypeJobData>): Promise<void> {
    const { makeId } = job.data;
    const xml = await this.vehicleFetchService.getVehicleTypesForMakeId(makeId);
    const vehicleTypes = this.vehicleParserService.parseVehicleType(xml);

    await this.makeModel.updateOne(
      { makeId },
      { $set: { vehicleTypes } },
    );
  }
}
