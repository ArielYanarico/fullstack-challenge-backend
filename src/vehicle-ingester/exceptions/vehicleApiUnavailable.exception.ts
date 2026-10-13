import { Logger } from '@nestjs/common';

export class VehicleApiUnavailableException extends Error {
  constructor(logger: Logger, originalError: Error, id?: string) {
    const details = originalError.message ?? 'N/A';
    const message = `Failed to fetch from vehicles api${id ? ` for make id:${id}` : ''}. Details: ${details}`;
    super(message);

    this.name = VehicleApiUnavailableException.name;

    logger.error(message, originalError.message);
  }
}
