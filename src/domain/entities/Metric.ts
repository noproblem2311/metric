export enum MetricType {
  DISTANCE = 'distance',
  TEMPERATURE = 'temperature',
}

export enum DistanceUnit {
  METER = 'meter',
  CENTIMETER = 'centimeter',
  INCH = 'inch',
  FEET = 'feet',
  YARD = 'yard',
}

export enum TemperatureUnit {
  KELVIN = 'kelvin',
  CELSIUS = 'celsius',
  FAHRENHEIT = 'fahrenheit',
}

export type MetricUnit = DistanceUnit | TemperatureUnit;

export class Metric {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: MetricType,
    public readonly value: number,
    public readonly originalUnit: MetricUnit,
    public readonly timestamp: number,
    public readonly createdAt: Date
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.userId) {
      throw new Error('UserId is required');
    }
    if (this.value < 0) {
      throw new Error('Value cannot be negative');
    }
    if (this.timestamp < 0) {
      throw new Error('Timestamp must be valid');
    }
  }

  isDistance(): boolean {
    return this.type === MetricType.DISTANCE;
  }

  isTemperature(): boolean {
    return this.type === MetricType.TEMPERATURE;
  }

  belongsTo(userId: string): boolean {
    return this.userId === userId;
  }

  isWithinRange(startTimestamp: number, endTimestamp: number): boolean {
    return this.timestamp >= startTimestamp && this.timestamp <= endTimestamp;
  }
}

export class ChartDataPoint {
  constructor(
    public readonly date: string,
    public readonly value: number,
    public readonly unit: MetricUnit,
    public readonly timestamp: number
  ) {}
}
