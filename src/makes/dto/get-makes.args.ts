import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class GetMakesArgs {
  @Field(() => Int, { defaultValue: 1, nullable: true })
  page: number = 1;

  @Field(() => Int, { defaultValue: 50, nullable: true })
  limit: number = 50;

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  all: boolean = false;

  @Field(() => String, { nullable: true })
  makeName?: string;

  @Field(() => String, { nullable: true })
  makeId?: string;
}
