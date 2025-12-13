import { Unit } from '../../../../src/domain/value-objects/Unit';
import { MetricType, DistanceUnit, TemperatureUnit } from '../../../../src/domain/entities/Metric';

describe('Unit Value Object', () => {
  describe('Distance Unit Validation', () => {
    it('should create valid meter unit', () => {
      const unit = new Unit(DistanceUnit.METER, MetricType.DISTANCE);
      expect(unit.getValue()).toBe(DistanceUnit.METER);
      expect(unit.getType()).toBe(MetricType.DISTANCE);
    });

    it('should create valid centimeter unit', () => {
      const unit = new Unit(DistanceUnit.CENTIMETER, MetricType.DISTANCE);
      expect(unit.getValue()).toBe(DistanceUnit.CENTIMETER);
    });

    it('should create valid inch unit', () => {
      const unit = new Unit(DistanceUnit.INCH, MetricType.DISTANCE);
      expect(unit.getValue()).toBe(DistanceUnit.INCH);
    });

    it('should create valid feet unit', () => {
      const unit = new Unit(DistanceUnit.FEET, MetricType.DISTANCE);
      expect(unit.getValue()).toBe(DistanceUnit.FEET);
    });

    it('should create valid yard unit', () => {
      const unit = new Unit(DistanceUnit.YARD, MetricType.DISTANCE);
      expect(unit.getValue()).toBe(DistanceUnit.YARD);
    });

    it('should throw error for invalid distance unit', () => {
      expect(() => {
        new Unit('invalid' as any, MetricType.DISTANCE);
      }).toThrow("Invalid unit 'invalid' for metric type 'distance'");
    });
  });

  describe('Temperature Unit Validation', () => {
    it('should create valid kelvin unit', () => {
      const unit = new Unit(TemperatureUnit.KELVIN, MetricType.TEMPERATURE);
      expect(unit.getValue()).toBe(TemperatureUnit.KELVIN);
      expect(unit.getType()).toBe(MetricType.TEMPERATURE);
    });

    it('should create valid celsius unit', () => {
      const unit = new Unit(TemperatureUnit.CELSIUS, MetricType.TEMPERATURE);
      expect(unit.getValue()).toBe(TemperatureUnit.CELSIUS);
    });

    it('should create valid fahrenheit unit', () => {
      const unit = new Unit(TemperatureUnit.FAHRENHEIT, MetricType.TEMPERATURE);
      expect(unit.getValue()).toBe(TemperatureUnit.FAHRENHEIT);
    });

    it('should throw error for invalid temperature unit', () => {
      expect(() => {
        new Unit('invalid' as any, MetricType.TEMPERATURE);
      }).toThrow("Invalid unit 'invalid' for metric type 'temperature'");
    });
  });

  describe('Distance Conversion to Base Unit (Meter)', () => {
    it('should convert meter to meter (base unit)', () => {
      const unit = new Unit(DistanceUnit.METER, MetricType.DISTANCE);
      expect(unit.toBaseUnit(100)).toBe(100);
    });

    it('should convert centimeter to meter', () => {
      const unit = new Unit(DistanceUnit.CENTIMETER, MetricType.DISTANCE);
      expect(unit.toBaseUnit(100)).toBe(1);
    });

    it('should convert inch to meter', () => {
      const unit = new Unit(DistanceUnit.INCH, MetricType.DISTANCE);
      expect(unit.toBaseUnit(100)).toBeCloseTo(2.54, 2);
    });

    it('should convert feet to meter', () => {
      const unit = new Unit(DistanceUnit.FEET, MetricType.DISTANCE);
      expect(unit.toBaseUnit(100)).toBeCloseTo(30.48, 2);
    });

    it('should convert yard to meter', () => {
      const unit = new Unit(DistanceUnit.YARD, MetricType.DISTANCE);
      expect(unit.toBaseUnit(100)).toBeCloseTo(91.44, 2);
    });
  });

  describe('Distance Conversion from Base Unit (Meter)', () => {
    it('should convert meter to meter', () => {
      const unit = new Unit(DistanceUnit.METER, MetricType.DISTANCE);
      expect(unit.fromBaseUnit(100)).toBe(100);
    });

    it('should convert meter to centimeter', () => {
      const unit = new Unit(DistanceUnit.CENTIMETER, MetricType.DISTANCE);
      expect(unit.fromBaseUnit(1)).toBe(100);
    });

    it('should convert meter to inch', () => {
      const unit = new Unit(DistanceUnit.INCH, MetricType.DISTANCE);
      expect(unit.fromBaseUnit(2.54)).toBeCloseTo(100, 1);
    });

    it('should convert meter to feet', () => {
      const unit = new Unit(DistanceUnit.FEET, MetricType.DISTANCE);
      expect(unit.fromBaseUnit(30.48)).toBeCloseTo(100, 1);
    });

    it('should convert meter to yard', () => {
      const unit = new Unit(DistanceUnit.YARD, MetricType.DISTANCE);
      expect(unit.fromBaseUnit(91.44)).toBeCloseTo(100, 1);
    });
  });

  describe('Temperature Conversion to Base Unit (Kelvin)', () => {
    it('should convert kelvin to kelvin (base unit)', () => {
      const unit = new Unit(TemperatureUnit.KELVIN, MetricType.TEMPERATURE);
      expect(unit.toBaseUnit(273.15)).toBe(273.15);
    });

    it('should convert celsius to kelvin', () => {
      const unit = new Unit(TemperatureUnit.CELSIUS, MetricType.TEMPERATURE);
      expect(unit.toBaseUnit(0)).toBe(273.15);
      expect(unit.toBaseUnit(25)).toBeCloseTo(298.15, 2);
    });

    it('should convert fahrenheit to kelvin', () => {
      const unit = new Unit(TemperatureUnit.FAHRENHEIT, MetricType.TEMPERATURE);
      expect(unit.toBaseUnit(32)).toBeCloseTo(273.15, 2);
      expect(unit.toBaseUnit(77)).toBeCloseTo(298.15, 2);
    });
  });

  describe('Temperature Conversion from Base Unit (Kelvin)', () => {
    it('should convert kelvin to kelvin', () => {
      const unit = new Unit(TemperatureUnit.KELVIN, MetricType.TEMPERATURE);
      expect(unit.fromBaseUnit(273.15)).toBe(273.15);
    });

    it('should convert kelvin to celsius', () => {
      const unit = new Unit(TemperatureUnit.CELSIUS, MetricType.TEMPERATURE);
      expect(unit.fromBaseUnit(273.15)).toBeCloseTo(0, 2);
      expect(unit.fromBaseUnit(298.15)).toBeCloseTo(25, 2);
    });

    it('should convert kelvin to fahrenheit', () => {
      const unit = new Unit(TemperatureUnit.FAHRENHEIT, MetricType.TEMPERATURE);
      expect(unit.fromBaseUnit(273.15)).toBeCloseTo(32, 2);
      expect(unit.fromBaseUnit(298.15)).toBeCloseTo(77, 2);
    });
  });

  describe('getBaseUnit', () => {
    it('should return meter for distance type', () => {
      expect(Unit.getBaseUnit(MetricType.DISTANCE)).toBe(DistanceUnit.METER);
    });

    it('should return kelvin for temperature type', () => {
      expect(Unit.getBaseUnit(MetricType.TEMPERATURE)).toBe(TemperatureUnit.KELVIN);
    });
  });

  describe('equals', () => {
    it('should return true for equal units', () => {
      const unit1 = new Unit(DistanceUnit.METER, MetricType.DISTANCE);
      const unit2 = new Unit(DistanceUnit.METER, MetricType.DISTANCE);
      expect(unit1.equals(unit2)).toBe(true);
    });

    it('should return false for different unit values', () => {
      const unit1 = new Unit(DistanceUnit.METER, MetricType.DISTANCE);
      const unit2 = new Unit(DistanceUnit.CENTIMETER, MetricType.DISTANCE);
      expect(unit1.equals(unit2)).toBe(false);
    });

    it('should return false for different types', () => {
      const unit1 = new Unit(DistanceUnit.METER, MetricType.DISTANCE);
      const unit2 = new Unit(TemperatureUnit.KELVIN, MetricType.TEMPERATURE);
      expect(unit1.equals(unit2)).toBe(false);
    });
  });
});

