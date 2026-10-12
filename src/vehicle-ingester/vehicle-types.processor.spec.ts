import { describe, it, expect, beforeEach, vi } from 'vitest';

import { VehicleTypesProcessor } from './vehicle-types.processor';

describe('VehicleTypesProcessor', () => {
  let processor: VehicleTypesProcessor;
  let vehicleFetchService: {
    getVehicleTypesForMakeId: ReturnType<typeof vi.fn>;
  };
  let vehicleParserService: {
    parseVehicleType: ReturnType<typeof vi.fn>;
  };
  let configService: {
    get: ReturnType<typeof vi.fn>;
  };
  let makeModel: {
    updateOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vehicleFetchService = {
      getVehicleTypesForMakeId: vi.fn(),
    };

    vehicleParserService = {
      parseVehicleType: vi.fn(),
    };

    configService = {
      get: vi.fn(),
    };

    makeModel = {
      updateOne: vi.fn(),
    };

    processor = new VehicleTypesProcessor(
      vehicleFetchService as any,
      vehicleParserService as any,
      configService as any,
      makeModel as any,
    );
  });

  it('should fetch XML, parse types, and update make document', async () => {
    // Arrange
    vehicleFetchService.getVehicleTypesForMakeId.mockResolvedValue('<xml>types</xml>');
    vehicleParserService.parseVehicleType.mockReturnValue([
      { typeId: '1', typeName: 'Passenger Car' },
    ]);
    makeModel.updateOne.mockResolvedValue({} as any);

    const job = {
      data: { makeId: '440' },
    } as any;

    // Act
    await processor.process(job);

    // Assert
    expect(vehicleFetchService.getVehicleTypesForMakeId).toHaveBeenCalledWith('440');
    expect(vehicleParserService.parseVehicleType).toHaveBeenCalledWith('<xml>types</xml>');
    expect(makeModel.updateOne).toHaveBeenCalledWith(
      { makeId: '440' },
      { $set: { vehicleTypes: [{ typeId: '1', typeName: 'Passenger Car' }] } },
    );
  });
});
