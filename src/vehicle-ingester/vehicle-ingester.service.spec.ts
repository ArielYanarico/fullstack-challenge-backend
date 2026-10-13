import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { getQueueToken } from '@nestjs/bullmq';
import { VehicleIngesterService } from './vehicle-ingester.service';
import { VehicleFetchService } from './vehicle-fetch.service';
import { VehicleParserService } from './vehicle-parser.service';
import { Make } from './schemas/make.schema';

describe('VehicleIngesterService', () => {
  let service: VehicleIngesterService;
  let vehicleFetchService: {
    getAllMakes: ReturnType<typeof vi.fn>;
    getVehicleTypesForMakeId: ReturnType<typeof vi.fn>;
  };
  let vehicleParserService: {
    parseMakes: ReturnType<typeof vi.fn>;
    parseVehicleType: ReturnType<typeof vi.fn>;
  };
  let makeModel: {
    countDocuments: ReturnType<typeof vi.fn>;
    bulkWrite: ReturnType<typeof vi.fn>;
  };
  let vehicleTypesQueue: {
    addBulk: ReturnType<typeof vi.fn>;
  };
  let finalizeQueue: {
    add: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    vehicleFetchService = {
      getAllMakes: vi.fn(),
      getVehicleTypesForMakeId: vi.fn(),
    };

    vehicleParserService = {
      parseMakes: vi.fn(),
      parseVehicleType: vi.fn(),
    };

    makeModel = {
      countDocuments: vi.fn(),
      bulkWrite: vi.fn(),
    };

    vehicleTypesQueue = {
      addBulk: vi.fn(),
    };

    finalizeQueue = {
      add: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehicleIngesterService,
        {
          provide: VehicleFetchService,
          useValue: vehicleFetchService,
        },
        {
          provide: VehicleParserService,
          useValue: vehicleParserService,
        },
        {
          provide: getModelToken(Make.name),
          useValue: makeModel,
        },
        {
          provide: getQueueToken('vehicle-types'),
          useValue: vehicleTypesQueue,
        },
        {
          provide: getQueueToken('ingestion-finalize'),
          useValue: finalizeQueue,
        },
      ],
    }).compile();

    service = module.get<VehicleIngesterService>(VehicleIngesterService);
  });

  it('should be defined', () => {
    // Assert
    expect(service).toBeDefined();
  });

  describe('onApplicationBootstrap', () => {
    it('should skip ingestion if db already has makes', async () => {
      // Arrange
      makeModel.countDocuments.mockResolvedValue(100);
      const ingestAllSpy = vi.spyOn(service as any, 'ingestAll');

      // Act
      await service.onApplicationBootstrap();

      // Asert
      expect(ingestAllSpy).not.toHaveBeenCalled();
    });

    it('should trigger ingestAll if db is empty', async () => {
      // Arrange
      makeModel.countDocuments.mockResolvedValue(0);
      const ingestAllSpy = vi
        .spyOn(service as any, 'ingestAll')
        .mockResolvedValue(undefined);

      // Act
      await service.onApplicationBootstrap();

      // Assert
      expect(ingestAllSpy).toHaveBeenCalled();
    });
  });

  describe('handleCron', () => {
    it('should fetch makes and upsert into mongo and enqueue jobs', async () => {
      // Arrange
      vehicleFetchService.getAllMakes.mockResolvedValue('<xml>makes</xml>');
      vehicleParserService.parseMakes.mockReturnValue([
        { makeId: '440', makeName: 'ASTON MARTIN' },
      ]);
      makeModel.bulkWrite.mockResolvedValue({} as any);
      vehicleTypesQueue.addBulk.mockResolvedValue({} as any);
      finalizeQueue.add.mockResolvedValue({} as any);

      // Act
      await service.handleCron();

      // Assert
      expect(vehicleParserService.parseMakes).toHaveBeenCalledWith(
        '<xml>makes</xml>',
      );
      expect(vehicleTypesQueue.addBulk).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'fetch-vehicle-types',
          data: { makeId: '440' },
        }),
      ]);
      expect(finalizeQueue.add).toHaveBeenCalledWith(
        'finalize-run',
        expect.objectContaining({ runId: expect.any(String) }),
        expect.objectContaining({ delay: 5000 }),
      );
    });
  });
});
