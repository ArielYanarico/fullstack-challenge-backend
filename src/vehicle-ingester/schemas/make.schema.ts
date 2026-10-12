import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MakeDocument = HydratedDocument<Make>;

@Schema()
export class Make {
  @Prop()
  makeId!: string;

  @Prop()
  makeName!: string;
}

export const MakeSchema = SchemaFactory.createForClass(Make);
