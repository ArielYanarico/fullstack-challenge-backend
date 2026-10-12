import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Make } from '../vehicle-ingester/schemas/make.schema';
import { GetMakesArgs } from './dto/get-makes.args';

@Injectable()
export class MakesService {
  constructor(
    @InjectModel(Make.name)
    private readonly makeModel: Model<Make>,
  ) {}

  private buildFilter(args: Pick<GetMakesArgs, 'makeName' | 'makeId'>): Record<string, any> {
    const filter: Record<string, any> = {};

    if (args.makeId) {
      filter.makeId = args.makeId.trim();
    }

    if (args.makeName) {
      const escaped = args.makeName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.makeName = { $regex: escaped, $options: 'i' };
    }

    return filter;
  }

  async findAll(args: GetMakesArgs): Promise<Make[]> {
    const filter = this.buildFilter(args);
    const query = this.makeModel
      .find(filter, { _id: 0, makeId: 1, makeName: 1, vehicleTypes: 1 })
      .sort({ makeName: 1 })
      .lean();

    if (!args.all) {
      const page = Math.max(1, args.page || 1);
      const limit = Math.min(100, Math.max(1, args.limit || 50));
      const skip = (page - 1) * limit;

      query.skip(skip).limit(limit);
    }

    return query.exec();
  }

  async count(args: Pick<GetMakesArgs, 'makeName' | 'makeId'>): Promise<number> {
    const filter = this.buildFilter(args);
    return this.makeModel.countDocuments(filter).exec();
  }
}
