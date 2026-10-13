import { BaseResponse, ResponseFromXML } from './shared.type';

export interface MakeType {
  makeId: string;
  makeName: string;
}

export interface MakeFromXML {
  Make_ID: number;
  Make_Name: string;
}

export interface MakeResponse extends BaseResponse {
  Results: {
    AllVehicleMakes: [MakeFromXML];
  };
}

export interface MakeResponseFromXML extends ResponseFromXML {
  Response: MakeResponse;
}
