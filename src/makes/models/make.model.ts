import { Field, ObjectType } from '@nestjs/graphql';
import { VehicleTypeModel } from './vehicle-type.model';

@ObjectType()
export class MakeModel {
  @Field(() => String)
  makeId!: string;

  @Field(() => String)
  makeName!: string;

  @Field(() => [VehicleTypeModel])
  vehicleTypes!: VehicleTypeModel[];
}
