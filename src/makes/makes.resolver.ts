import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class MakesResolver {
  @Query(() => String)
  getMakes(): string {
    return 'Nothing to show yet!';
  }
}
