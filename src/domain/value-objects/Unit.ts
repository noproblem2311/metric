import { MetricType, DistanceUnit, TemperatureUnit, MetricUnit } from '../entities/Metric';

export class Unit {
  private readonly value: MetricUnit;
  private readonly type: MetricType;

  constructor(unit: MetricUnit, type: MetricType) {
    if (!this.isValidUnit(unit, type)) {
      throw new Error(`Invalid unit '${unit}' for metric type '${type}'`);
    }
    this.value = unit;
    this.type = type;
  }

  private isValidUnit(unit: MetricUnit, type: MetricType): boolean {
    if (type === MetricType.DISTANCE) {
      return Object.values(DistanceUnit).includes(unit as DistanceUnit);
    } else if (type === MetricType.TEMPERATURE) {
      return Object.values(TemperatureUnit).includes(unit as TemperatureUnit);
    }
    return false;
  }

  getValue(): MetricUnit {
    return this.value;
  }

  getType(): MetricType {
    return this.type;
  }

  toBaseUnit(value: number): number {
    if (this.type === MetricType.DISTANCE) {
      return this.distanceToBase(value);
    } else if (this.type === MetricType.TEMPERATURE) {
      return this.temperatureToBase(value);
    }
    throw new Error(`Unsupported metric type: ${this.type}`);
  }

  fromBaseUnit(value: number): number {
    if (this.type === MetricType.DISTANCE) {
      return this.distanceFromBase(value);
    } else if (this.type === MetricType.TEMPERATURE) {
      return this.temperatureFromBase(value);
    }
    throw new Error(`Unsupported metric type: ${this.type}`);
  }

  private distanceToBase(value: number): number {
    const factors: Record<DistanceUnit, number> = {
      [DistanceUnit.METER]: 1,
      [DistanceUnit.CENTIMETER]: 0.01,
      [DistanceUnit.INCH]: 0.0254,
      [DistanceUnit.FEET]: 0.3048,
      [DistanceUnit.YARD]: 0.9144,
    };
    return value * factors[this.value as DistanceUnit];
  }

  private distanceFromBase(value: number): number {
    const factors: Record<DistanceUnit, number> = {
      [DistanceUnit.METER]: 1,
      [DistanceUnit.CENTIMETER]: 0.01,
      [DistanceUnit.INCH]: 0.0254,
      [DistanceUnit.FEET]: 0.3048,
      [DistanceUnit.YARD]: 0.9144,
    };
    return value / factors[this.value as DistanceUnit];
  }

  private temperatureToBase(value: number): number {
    const unit = this.value as TemperatureUnit;
    switch (unit) {
      case TemperatureUnit.KELVIN:
        return value;
      case TemperatureUnit.CELSIUS:
        return value + 273.15;
      case TemperatureUnit.FAHRENHEIT:
        return ((value - 32) * 5) / 9 + 273.15;
    }
  }

  private temperatureFromBase(value: number): number {
    const unit = this.value as TemperatureUnit;
    switch (unit) {
      case TemperatureUnit.KELVIN:
        return value;
      case TemperatureUnit.CELSIUS:
        return value - 273.15;
      case TemperatureUnit.FAHRENHEIT:
        return ((value - 273.15) * 9) / 5 + 32;
    }
  }

  static getBaseUnit(type: MetricType): MetricUnit {
    switch (type) {
      case MetricType.DISTANCE:
        return DistanceUnit.METER;
      case MetricType.TEMPERATURE:
        return TemperatureUnit.KELVIN;
    }
  }

  equals(other: Unit): boolean {
    return this.value === other.value && this.type === other.type;
  }
}
