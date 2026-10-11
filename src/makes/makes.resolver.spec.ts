import { Test, TestingModule } from '@nestjs/testing';
import { MakesResolver } from './makes.resolver';

describe('MakesResolver', () => {
  let resolver: MakesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MakesResolver],
    }).compile();

    resolver = module.get<MakesResolver>(MakesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
