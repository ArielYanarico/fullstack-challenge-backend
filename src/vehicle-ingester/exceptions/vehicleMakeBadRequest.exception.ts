import { Logger } from "@nestjs/common";

export class VehicleMakeBadRequestException extends Error {
  constructor(logger: Logger, makeId: string) {
    const message = `Vehicle make ${makeId} is not valid.`;
    super(message);

    this.name = VehicleMakeBadRequestException.name;
    logger.warn(message);
  }
}
