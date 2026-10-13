import { Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import {
  VehicleTypeResponseFromXML,
  VehicleType,
  VehicleTypeFromXML,
} from './types/vehicleType.type';
import { XmlParsingException } from './exceptions/xmlParsing.exception';
import { MakeFromXML, MakeResponseFromXML, MakeType } from './types/make.type';

@Injectable()
export class VehicleParserService {
  private readonly logger = new Logger(VehicleParserService.name);
  private readonly arrayNodes = new Set([
    'VehicleTypesForMakeIds',
    'AllVehicleMakes',
  ]);
  private readonly xmlParser = new XMLParser({
    isArray: (tagName: string) => this.arrayNodes.has(tagName),
  });

  parseVehicleType(xmlData: string): VehicleType[] {
    try {
      const jsonData: VehicleTypeResponseFromXML = this.xmlParser.parse(
        xmlData,
      ) as VehicleTypeResponseFromXML;
      const vehicleTypes = jsonData?.Response?.Results?.VehicleTypesForMakeIds;

      if (!vehicleTypes || !Array.isArray(vehicleTypes))
        throw new XmlParsingException(this.logger);

      const vehicleTypesMapped = vehicleTypes.map(this.mapVehicleType);

      this.logger.debug(
        `Vehicle types parsed successfully! count: ${vehicleTypesMapped.length}`,
      );
      return vehicleTypesMapped;
    } catch (error) {
      if (error instanceof XmlParsingException) return [];
      else throw error;
    }
  }

  private mapVehicleType(data: VehicleTypeFromXML): VehicleType {
    return {
      typeId: data.VehicleTypeId?.toString() ?? '',
      typeName: data.VehicleTypeName ?? 'Unknown',
    };
  }

  parseMakes(xmlData: string): MakeType[] {
    try {
      const jsonData: MakeResponseFromXML = this.xmlParser.parse(
        xmlData,
      ) as MakeResponseFromXML;
      const makes = jsonData?.Response?.Results?.AllVehicleMakes;

      if (!makes || !Array.isArray(makes))
        throw new XmlParsingException(this.logger);

      const makesMapped = makes.map(this.mapMake);

      this.logger.log(
        `Makes parsed successfully! count: ${makesMapped.length}`,
      );
      return makesMapped;
    } catch (error) {
      if (error instanceof XmlParsingException) return [];
      else throw error;
    }
  }

  private mapMake(data: MakeFromXML): MakeType {
    return {
      makeId: data.Make_ID?.toString() ?? '',
      makeName: data.Make_Name ?? 'Make Unknown',
    };
  }
}
