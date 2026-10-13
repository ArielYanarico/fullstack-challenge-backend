import { BaseResponse, ResponseFromXML } from './shared.type';

export interface VehicleType {
  typeId: string;
  typeName: string;
}

export interface VehicleTypeFromXML {
  VehicleTypeId: number;
  VehicleTypeName: string;
}

export interface VehicleTypeResponse extends BaseResponse {
  Results: {
    VehicleTypesForMakeIds: [VehicleTypeFromXML];
  };
}

export interface VehicleTypeResponseFromXML extends ResponseFromXML {
  Response: VehicleTypeResponse;
}
