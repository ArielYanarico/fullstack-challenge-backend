import { Test, TestingModule } from '@nestjs/testing';
import { VehicleIngesterService } from './vehicle-ingester.service';

describe('VehicleIngesterService', () => {
  let service: VehicleIngesterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VehicleIngesterService],
    }).compile();

    service = module.get<VehicleIngesterService>(VehicleIngesterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
