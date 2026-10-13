import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MakesService } from './makes.service';
import { Make } from '../vehicle-ingester/schemas/make.schema';

describe('MakesService', () => {
  let service: MakesService;
  let makeModel: {
    find: ReturnType<typeof vi.fn>;
    countDocuments: ReturnType<typeof vi.fn>;
  };
  let mockQuery: any;

  beforeEach(async () => {
    mockQuery = {
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      exec: vi.fn(),
    };

    makeModel = {
      find: vi.fn().mockReturnValue(mockQuery),
      countDocuments: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MakesService,
        {
          provide: getModelToken(Make.name),
          useValue: makeModel,
        },
      ],
    }).compile();

    service = module.get<MakesService>(MakesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should paginate results by default (page 1, limit 50)', async () => {
      mockQuery.exec.mockResolvedValue([
        { makeId: '1', makeName: 'Acura', vehicleTypes: [] },
      ]);

      const result = await service.findAll({
        page: 1,
        limit: 50,
        all: false,
      });

      expect(makeModel.find).toHaveBeenCalledWith(
        {},
        { _id: 0, makeId: 1, makeName: 1, vehicleTypes: 1 },
      );
      expect(mockQuery.sort).toHaveBeenCalledWith({ makeName: 1 });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(50);
      expect(result).toHaveLength(1);
      expect(result[0].makeName).toBe('Acura');
    });

    it('should calculate correct skip for page 2', async () => {
      mockQuery.exec.mockResolvedValue([]);

      await service.findAll({
        page: 2,
        limit: 20,
        all: false,
      });

      expect(mockQuery.skip).toHaveBeenCalledWith(20);
      expect(mockQuery.limit).toHaveBeenCalledWith(20);
    });

    it('should not paginate when all flag is true', async () => {
      mockQuery.exec.mockResolvedValue([
        { makeId: '1', makeName: 'Acura', vehicleTypes: [] },
        { makeId: '2', makeName: 'Audi', vehicleTypes: [] },
      ]);

      const result = await service.findAll({
        page: 1,
        limit: 50,
        all: true,
      });

      expect(mockQuery.sort).toHaveBeenCalledWith({ makeName: 1 });
      expect(mockQuery.skip).not.toHaveBeenCalled();
      expect(mockQuery.limit).not.toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should filter by makeName with escaped regex case-insensitively', async () => {
      mockQuery.exec.mockResolvedValue([]);

      await service.findAll({
        page: 1,
        limit: 50,
        all: false,
        makeName: 'toy.ota',
      });

      expect(makeModel.find).toHaveBeenCalledWith(
        { makeName: { $regex: 'toy\\.ota', $options: 'i' } },
        expect.any(Object),
      );
    });

    it('should filter by makeId', async () => {
      mockQuery.exec.mockResolvedValue([]);

      await service.findAll({
        page: 1,
        limit: 50,
        all: false,
        makeId: '440',
      });

      expect(makeModel.find).toHaveBeenCalledWith(
        { makeId: '440' },
        expect.any(Object),
      );
    });
  });

  describe('count', () => {
    it('should return count with matching filter', async () => {
      const mockExec = vi.fn().mockResolvedValue(42);
      makeModel.countDocuments.mockReturnValue({ exec: mockExec });

      const count = await service.count({ makeName: 'ford' });

      expect(makeModel.countDocuments).toHaveBeenCalledWith({
        makeName: { $regex: 'ford', $options: 'i' },
      });
      expect(count).toBe(42);
    });
  });
});
