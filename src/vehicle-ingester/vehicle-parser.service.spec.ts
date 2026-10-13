import { VehicleParserService } from './vehicle-parser.service';

describe('VehicleParserService', () => {
  let service: VehicleParserService;

  beforeEach(() => {
    service = new VehicleParserService();
  });

  describe('parseVehicleType', () => {
    it('should parse multiple vehicle types from XML', () => {
      // Arrange
      const xmlWithMultipleVehicelTypes = `
        <Response>
          <Results>
            <VehicleTypesForMakeIds>
              <VehicleTypeId>1</VehicleTypeId>
              <VehicleTypeName>Passenger Car</VehicleTypeName>
            </VehicleTypesForMakeIds>
            <VehicleTypesForMakeIds>
              <VehicleTypeId>2</VehicleTypeId>
              <VehicleTypeName>Truck</VehicleTypeName>
            </VehicleTypesForMakeIds>
          </Results>
        </Response>
      `;

      // Act
      const result = service.parseVehicleType(xmlWithMultipleVehicelTypes);

      //Assert
      expect(result).toEqual([
        { typeId: '1', typeName: 'Passenger Car' },
        { typeId: '2', typeName: 'Truck' },
      ]);
    });

    it('should return empty array when XML is empty or missing vehicle types', () => {
      // Arrange
      const xml = `<Response><Results></Results></Response>`;

      // Act
      const result = service.parseVehicleType(xml);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('parseMakes', () => {
    it('should parse multiple makes from XML', () => {
      // Arrange
      const xmlWithMultipleMakes = `
        <Response>
          <Results>
            <AllVehicleMakes>
              <Make_ID>440</Make_ID>
              <Make_Name>ASTON MARTIN</Make_Name>
            </AllVehicleMakes>
            <AllVehicleMakes>
              <Make_ID>441</Make_ID>
              <Make_Name>TESLA</Make_Name>
            </AllVehicleMakes>
          </Results>
        </Response>
      `;

      // Act
      const result = service.parseMakes(xmlWithMultipleMakes);

      // Assert
      expect(result).toEqual([
        { makeId: '440', makeName: 'ASTON MARTIN' },
        { makeId: '441', makeName: 'TESLA' },
      ]);
    });

    it('should return empty array on invalid XML', () => {
      // Arrange
      const xml = `invalid xml`;

      // Act
      const result = service.parseMakes(xml);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
