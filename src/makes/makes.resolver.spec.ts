import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';

import { MakesResolver } from './makes.resolver';
import { MakesService } from './makes.service';

describe('MakesResolver', () => {
  let resolver: MakesResolver;
  let makesService: {
    findAll: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    makesService = {
      findAll: vi.fn(),
      count: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MakesResolver,
        {
          provide: MakesService,
          useValue: makesService,
        },
      ],
    }).compile();

    resolver = module.get<MakesResolver>(MakesResolver);
  });

  it('should be defined', () => {
    //Assert
    expect(resolver).toBeDefined();
  });

  describe('getMakes', () => {
    it('should call makesService.findAll with given arguments', async () => {
      // Arrange
      const mockResult = [
        {
          makeId: '440',
          makeName: 'ASTON MARTIN',
          vehicleTypes: [{ typeId: '1', typeName: 'Passenger Car' }],
        },
      ];
      makesService.findAll.mockResolvedValue(mockResult);
      const args = { page: 1, limit: 10, all: false, makeName: 'ASTON' };

      // Act
      const result = await resolver.getMakes(args);

      // Assert
      expect(makesService.findAll).toHaveBeenCalledWith(args);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getMakesCount', () => {
    it('should call makesService.count with filter arguments', async () => {
      // Arrange
      makesService.count.mockResolvedValue(12);

      // Act
      const result = await resolver.getMakesCount('ASTON', '440');

      // Asert
      expect(makesService.count).toHaveBeenCalledWith({
        makeName: 'ASTON',
        makeId: '440',
      });
      expect(result).toBe(12);
    });
  });
});
