import { describe, it, expect, beforeEach, vi } from 'vitest';

import { IngestionFinalizeProcessor } from './ingestion-finalize.processor';

describe('IngestionFinalizeProcessor', () => {
  let processor: IngestionFinalizeProcessor;
  let makeModel: { deleteMany: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    makeModel = {
      deleteMany: vi.fn(),
    };

    processor = new IngestionFinalizeProcessor(makeModel as any);
  });

  it('should delete stale makes not matching the current runId', async () => {
    // Arrange
    makeModel.deleteMany.mockResolvedValue({ deletedCount: 5 } as any);

    const job = {
      data: { runId: 'run-123' },
    } as any;

    // Act
    await processor.process(job);

    // Assert
    expect(makeModel.deleteMany).toHaveBeenCalledWith({ runId: { $ne: 'run-123' } });
  });
});
