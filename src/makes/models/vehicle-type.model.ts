import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VehicleTypeModel {
  @Field(() => String)
  typeId!: string;

  @Field(() => String)
  typeName!: string;
}
