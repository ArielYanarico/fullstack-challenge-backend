import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import { VehicleTypeResponseFromXML, VehicleType, VehicleTypeFromXML } from './types/vehicleType.type';
import { XmlParsingException } from './exceptions/xmlParsing.exception';

@Injectable()
export class VehicleParserService {
  private readonly logger = new Logger(VehicleParserService.name);
  private readonly xmlParser = new XMLParser();

  parseVehicleType(xmlData: string): VehicleType[] {
    try {
      const jsonData: VehicleTypeResponseFromXML = this.xmlParser.parse(xmlData);
      const vehicleTypes = jsonData?.Response?.Results?.VehicleTypesForMakeIds;

      if (!vehicleTypes || !Array.isArray(vehicleTypes)) throw new XmlParsingException(this.logger);

      const vehicleTypesMapped = vehicleTypes.map(this.mapVehicleType);

      this.logger.log({ vehicleTypesMapped }, 'Vehicle types parsed successfully!')
      return vehicleTypesMapped;
    } catch (error) {
      if (error instanceof XmlParsingException)
        return [];
      else
        throw error;
    }
  }

  private mapVehicleType(data: VehicleTypeFromXML): VehicleType {
    return {
      typeId: data.VehicleTypeId?.toString() ?? '',
      typeName: data.VehicleTypeName ?? 'Unknown',
    }
  }
}
