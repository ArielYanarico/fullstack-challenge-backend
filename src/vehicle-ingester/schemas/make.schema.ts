import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { VehicleType, VehicleTypeSchema } from './vehicleType.schema';

export type MakeDocument = HydratedDocument<Make>;

@Schema()
export class Make {
  @Prop({ required: true, unique: true })
  makeId!: string;

  @Prop({ required: true, index: true })
  makeName!: string;

  @Prop({ type: [VehicleTypeSchema], default: [] })
  vehicleTypes!: VehicleType[];
}

export const MakeSchema = SchemaFactory.createForClass(Make);
