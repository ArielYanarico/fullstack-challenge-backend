import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model } from 'mongoose';

import { Make } from './schemas/make.schema';

export interface FinalizeJobData {
  runId: string;
}

@Processor('ingestion-finalize')
export class IngestionFinalizeProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestionFinalizeProcessor.name);

  constructor(
    @InjectModel(Make.name)
    private readonly makeModel: Model<Make>,
  ) {
    super();
  }

  async process(job: Job<FinalizeJobData>): Promise<void> {
    const { runId } = job.data;
    this.logger.log(`Finalizing ingestion run: ${runId}`);

    const result = await this.makeModel.deleteMany({
      runId: { $ne: runId },
    });

    this.logger.log(`Cleaned up stale makes count: ${result.deletedCount}`);
  }
}
