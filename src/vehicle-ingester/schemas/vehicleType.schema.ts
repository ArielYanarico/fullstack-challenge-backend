import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VehicleTypeDocument = HydratedDocument<VehicleType>;

@Schema()
export class VehicleType {
  @Prop()
  typeId!: string;

  @Prop()
  typeName!: string;
}

export const VehicleTypeSchema = SchemaFactory.createForClass(VehicleType);
