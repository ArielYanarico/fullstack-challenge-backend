import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { VehicleFetchService } from './vehicle-fetch.service';
import { VehicleParserService } from './vehicle-parser.service';
import { Make } from './schemas/make.schema';
import { VehicleTypeJobData } from './vehicle-types.processor';

@Injectable()
export class VehicleIngesterService implements OnApplicationBootstrap {
  private readonly logger = new Logger(VehicleIngesterService.name);

  constructor(
    private readonly vehicleFetchService: VehicleFetchService,
    private readonly vehicleParseService: VehicleParserService,

    @InjectModel(Make.name)
    private makeModel: Model<Make>,

    @InjectQueue('vehicle-types')
    private vehicleTypesQueue: Queue<VehicleTypeJobData>,
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
    } catch (error) {
      this.logger.error({ err: error }, 'Ingestion failed');
    }
  }

  private async ingestMakes(): Promise<void> {
    const makesXml = await this.vehicleFetchService.getAllMakes();
    const makeTypes = this.vehicleParseService.parseMakes(makesXml);

    if (makeTypes.length === 0) {
      this.logger.warn('No makes to store, keeping previous data');
      return;
    }

    const bulkOps = makeTypes.map((make) => ({
      updateOne: {
        filter: { makeId: make.makeId },
        update: {
          $set: { makeName: make.makeName },
          $setOnInsert: { vehicleTypes: [] },
        },
        upsert: true,
      },
    }));

    await this.makeModel.bulkWrite(bulkOps);
    this.logger.log(`Makes upserted: ${makeTypes.length}`);

    const jobs = makeTypes.map((make) => ({
      name: 'fetch-vehicle-types',
      data: { makeId: make.makeId },
      opts: {
        jobId: `make-${make.makeId}`,
      },
    }));

    await this.vehicleTypesQueue.addBulk(jobs);
    this.logger.log(`Queued vehicle types jobs: ${jobs.length}`);
  }
}
