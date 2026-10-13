import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class VehicleType {
  @Prop({ required: true })
  typeId!: string;

  @Prop({ required: true })
  typeName!: string;
}

export const VehicleTypeSchema = SchemaFactory.createForClass(VehicleType);
