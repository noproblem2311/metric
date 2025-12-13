import { Metric, MetricType, DistanceUnit, TemperatureUnit, ChartDataPoint } from '../../../../src/domain/entities/Metric';

describe('Metric Entity', () => {
  describe('Constructor and Validation', () => {
    it('should create a valid distance metric', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date('2023-12-13T10:30:00.000Z')
      );

      expect(metric.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(metric.userId).toBe('user123');
      expect(metric.type).toBe(MetricType.DISTANCE);
      expect(metric.value).toBe(100);
      expect(metric.originalUnit).toBe(DistanceUnit.METER);
      expect(metric.timestamp).toBe(1702468200);
    });

    it('should create a valid temperature metric', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174001',
        'user456',
        MetricType.TEMPERATURE,
        298.15,
        TemperatureUnit.KELVIN,
        1702468200,
        new Date('2023-12-13T10:30:00.000Z')
      );

      expect(metric.id).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(metric.type).toBe(MetricType.TEMPERATURE);
      expect(metric.value).toBe(298.15);
      expect(metric.originalUnit).toBe(TemperatureUnit.KELVIN);
    });

    it('should throw error when userId is empty', () => {
      expect(() => {
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          '',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702468200,
          new Date()
        );
      }).toThrow('UserId is required');
    });

    it('should throw error when value is negative', () => {
      expect(() => {
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          -10,
          DistanceUnit.METER,
          1702468200,
          new Date()
        );
      }).toThrow('Value cannot be negative');
    });

    it('should throw error when timestamp is negative', () => {
      expect(() => {
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          -1,
          new Date()
        );
      }).toThrow('Timestamp must be valid');
    });
  });

  describe('isDistance', () => {
    it('should return true for distance metric', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date()
      );

      expect(metric.isDistance()).toBe(true);
    });

    it('should return false for temperature metric', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.TEMPERATURE,
        298.15,
        TemperatureUnit.KELVIN,
        1702468200,
        new Date()
      );

      expect(metric.isDistance()).toBe(false);
    });
  });

  describe('isTemperature', () => {
    it('should return true for temperature metric', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.TEMPERATURE,
        298.15,
        TemperatureUnit.KELVIN,
        1702468200,
        new Date()
      );

      expect(metric.isTemperature()).toBe(true);
    });

    it('should return false for distance metric', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date()
      );

      expect(metric.isTemperature()).toBe(false);
    });
  });

  describe('belongsTo', () => {
    it('should return true when metric belongs to user', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date()
      );

      expect(metric.belongsTo('user123')).toBe(true);
    });

    it('should return false when metric does not belong to user', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date()
      );

      expect(metric.belongsTo('user456')).toBe(false);
    });
  });

  describe('isWithinRange', () => {
    it('should return true when metric is within range', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date()
      );

      expect(metric.isWithinRange(1702468100, 1702468300)).toBe(true);
    });

    it('should return true when metric timestamp equals start', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date()
      );

      expect(metric.isWithinRange(1702468200, 1702468300)).toBe(true);
    });

    it('should return true when metric timestamp equals end', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date()
      );

      expect(metric.isWithinRange(1702468100, 1702468200)).toBe(true);
    });

    it('should return false when metric is before range', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date()
      );

      expect(metric.isWithinRange(1702468300, 1702468400)).toBe(false);
    });

    it('should return false when metric is after range', () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date()
      );

      expect(metric.isWithinRange(1702468000, 1702468100)).toBe(false);
    });
  });
});

describe('ChartDataPoint', () => {
  it('should create a valid chart data point', () => {
    const dataPoint = new ChartDataPoint(
      '2023-12-13',
      100,
      DistanceUnit.METER,
      1702468200
    );

    expect(dataPoint.date).toBe('2023-12-13');
    expect(dataPoint.value).toBe(100);
    expect(dataPoint.unit).toBe(DistanceUnit.METER);
    expect(dataPoint.timestamp).toBe(1702468200);
  });
});

