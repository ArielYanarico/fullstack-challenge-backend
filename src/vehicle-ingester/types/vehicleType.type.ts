
export interface VehicleType {
  typeId: string,
  typeName: string,
}

export interface VehicleTypeFromXML {
  VehicleTypeId: number,
  VehicleTypeName: string,
}

export interface VehicleTypeResponseFromXML {
  Response: {
    Count: number,
    Message: string,
    SearchCriteria: string,
    Results: {
      VehicleTypesForMakeIds: [VehicleTypeFromXML]
    }
  },
}
