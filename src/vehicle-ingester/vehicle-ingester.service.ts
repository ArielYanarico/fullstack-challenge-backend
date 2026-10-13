import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { VehicleFetchService } from './vehicle-fetch.service';
import { VehicleParserService } from './vehicle-parser.service';
import { Make } from './schemas/make.schema';
import { VehicleTypeJobData } from './vehicle-types.processor';
import { FinalizeJobData } from './ingestion-finalize.processor';

@Injectable()
export class VehicleIngesterService implements OnApplicationBootstrap {
  private readonly logger = new Logger(VehicleIngesterService.name);
  private isIngesting = false;

  constructor(
    private readonly vehicleFetchService: VehicleFetchService,
    private readonly vehicleParseService: VehicleParserService,

    @InjectModel(Make.name)
    private makeModel: Model<Make>,

    @InjectQueue('vehicle-types')
    private vehicleTypesQueue: Queue<VehicleTypeJobData>,

    @InjectQueue('ingestion-finalize')
    private finalizeQueue: Queue<FinalizeJobData>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const existingCount = await this.makeModel.countDocuments();
    if (existingCount > 0) {
      this.logger.log(
        `Database already has ${existingCount} makes, skipping initial ingestion`,
      );
      return;
    }

    this.logger.log('Starting up makes and vehicle types...');
    void this.ingestAll();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron(): Promise<void> {
    this.logger.log('Scheduled ingestion of makes and vehicle types data...');
    await this.ingestAll();
  }

  private async ingestAll(): Promise<void> {
    if (this.isIngesting) {
      this.logger.warn('Ingestion run already in progress, skipping');
      return;
    }

    this.isIngesting = true;
    const runId = randomUUID();

    try {
      await this.ingestMakes(runId);
    } catch (error) {
      this.logger.error({ err: error as Error }, 'Ingestion failed');
    } finally {
      this.isIngesting = false;
    }
  }

  private async ingestMakes(runId: string): Promise<void> {
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
          $set: {
            makeName: make.makeName,
            runId,
          },
          $setOnInsert: { vehicleTypes: [] },
        },
        upsert: true,
      },
    }));

    await this.makeModel.bulkWrite(bulkOps);
    this.logger.log(`Makes upserted with runId ${runId}: ${makeTypes.length}`);

    const jobs = makeTypes.map((make) => ({
      name: 'fetch-vehicle-types',
      data: { makeId: make.makeId },
      opts: {
        jobId: `make-${make.makeId}-${runId}`,
      },
    }));

    await this.vehicleTypesQueue.addBulk(jobs);
    this.logger.log(`Queued vehicle types jobs: ${jobs.length}`);

    await this.finalizeQueue.add(
      'finalize-run',
      { runId },
      {
        jobId: `finalize-${runId}`,
        delay: 5000,
      },
    );
  }
}
