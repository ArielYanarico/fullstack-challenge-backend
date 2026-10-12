import { Logger } from "@nestjs/common";

export class XmlParsingException extends Error {
  constructor(logger: Logger) {
    const message = 'Invalid XML structure or missing values';
    super(message);

    this.name = XmlParsingException.name;
    logger.error(message);
  }
}
