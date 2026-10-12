import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { MakesService } from './makes.service';
import { MakeModel } from './models/make.model';
import { GetMakesArgs } from './dto/get-makes.args';

@Resolver(() => MakeModel)
export class MakesResolver {
  constructor(private readonly makesService: MakesService) {}

  @Query(() => [MakeModel], { name: 'makes' })
  async getMakes(@Args() args: GetMakesArgs): Promise<MakeModel[]> {
    return this.makesService.findAll(args);
  }

  @Query(() => Int, { name: 'makesCount' })
  async getMakesCount(
    @Args('makeName', { type: () => String, nullable: true }) makeName?: string,
    @Args('makeId', { type: () => String, nullable: true }) makeId?: string,
  ): Promise<number> {
    return this.makesService.count({ makeName, makeId });
  }
}
