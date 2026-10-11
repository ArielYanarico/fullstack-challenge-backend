import { Test, TestingModule } from '@nestjs/testing';
import { MakesService } from './makes.service';

describe('MakesService', () => {
  let service: MakesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MakesService],
    }).compile();

    service = module.get<MakesService>(MakesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
