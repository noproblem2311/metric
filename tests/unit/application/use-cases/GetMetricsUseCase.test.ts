import { GetMetricsUseCase } from '../../../../src/application/use-cases/GetMetricsUseCase';
import { IMetricRepository } from '../../../../src/domain/repositories/IMetricRepository';
import { Metric, MetricType, DistanceUnit, TemperatureUnit } from '../../../../src/domain/entities/Metric';
import { GetMetricsDTO } from '../../../../src/application/dtos/MetricDTOs';

class MockMetricRepository implements IMetricRepository {
  private metrics: Metric[] = [];

  setMockData(metrics: Metric[]): void {
    this.metrics = metrics;
  }

  async save(metric: Metric): Promise<Metric> {
    this.metrics.push(metric);
    return metric;
  }

  async findById(_id: string, _userId: string): Promise<Metric | null> {
    return null;
  }

  async findByUserAndType(userId: string, type: MetricType): Promise<Metric[]> {
    return this.metrics.filter(m => m.userId === userId && m.type === type);
  }

  async findByUserTypeAndTimeRange(
    userId: string,
    type: MetricType,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<Metric[]> {
    return this.metrics.filter(
      m => m.userId === userId && m.type === type && m.timestamp >= startTimestamp && m.timestamp <= endTimestamp
    );
  }

  async delete(_id: string, _userId: string): Promise<boolean> {
    return false;
  }
}

describe('GetMetricsUseCase', () => {
  let useCase: GetMetricsUseCase;
  let mockRepository: MockMetricRepository;

  beforeEach(() => {
    mockRepository = new MockMetricRepository();
    useCase = new GetMetricsUseCase(mockRepository);
  });

  describe('Get Distance Metrics', () => {
    it('should return distance metrics in meters', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702468200,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(100);
      expect(result[0].unit).toBe(DistanceUnit.METER);
    });

    it('should convert distance metrics from meters to centimeters', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          1,
          DistanceUnit.METER,
          1702468200,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.CENTIMETER,
      };

      const result = await useCase.execute(dto);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(100);
      expect(result[0].unit).toBe(DistanceUnit.CENTIMETER);
    });

    it('should convert distance metrics from meters to inches', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          2.54,
          DistanceUnit.METER,
          1702468200,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.INCH,
      };

      const result = await useCase.execute(dto);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBeCloseTo(100, 1);
      expect(result[0].unit).toBe(DistanceUnit.INCH);
    });

    it('should convert distance metrics from meters to feet', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          30.48,
          DistanceUnit.METER,
          1702468200,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.FEET,
      };

      const result = await useCase.execute(dto);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBeCloseTo(100, 1);
      expect(result[0].unit).toBe(DistanceUnit.FEET);
    });
  });

  describe('Get Temperature Metrics', () => {
    it('should return temperature metrics in kelvin', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.TEMPERATURE,
          273.15,
          TemperatureUnit.KELVIN,
          1702468200,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.TEMPERATURE,
        unit: TemperatureUnit.KELVIN,
      };

      const result = await useCase.execute(dto);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBe(273.15);
      expect(result[0].unit).toBe(TemperatureUnit.KELVIN);
    });

    it('should convert temperature metrics from kelvin to celsius', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.TEMPERATURE,
          273.15,
          TemperatureUnit.KELVIN,
          1702468200,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.TEMPERATURE,
        unit: TemperatureUnit.CELSIUS,
      };

      const result = await useCase.execute(dto);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBeCloseTo(0, 2);
      expect(result[0].unit).toBe(TemperatureUnit.CELSIUS);
    });

    it('should convert temperature metrics from kelvin to fahrenheit', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.TEMPERATURE,
          273.15,
          TemperatureUnit.KELVIN,
          1702468200,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.TEMPERATURE,
        unit: TemperatureUnit.FAHRENHEIT,
      };

      const result = await useCase.execute(dto);

      expect(result).toHaveLength(1);
      expect(result[0].value).toBeCloseTo(32, 1);
      expect(result[0].unit).toBe(TemperatureUnit.FAHRENHEIT);
    });
  });

  describe('Multiple Metrics', () => {
    it('should return multiple metrics for the same user', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702468200,
          new Date()
        ),
        new Metric(
          '123e4567-e89b-12d3-a456-426614174001',
          'user123',
          MetricType.DISTANCE,
          200,
          DistanceUnit.METER,
          1702468300,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(100);
      expect(result[1].value).toBe(200);
    });

    it('should filter metrics by user', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702468200,
          new Date()
        ),
        new Metric(
          '123e4567-e89b-12d3-a456-426614174001',
          'user456',
          MetricType.DISTANCE,
          200,
          DistanceUnit.METER,
          1702468300,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user123');
    });

    it('should filter metrics by type', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702468200,
          new Date()
        ),
        new Metric(
          '123e4567-e89b-12d3-a456-426614174001',
          'user123',
          MetricType.TEMPERATURE,
          273.15,
          TemperatureUnit.KELVIN,
          1702468300,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(MetricType.DISTANCE);
    });
  });

  describe('Empty Results', () => {
    it('should return empty array when no metrics found', async () => {
      mockRepository.setMockData([]);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result).toEqual([]);
    });
  });

  describe('Response Format', () => {
    it('should return metrics with correct response format', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702468200,
          new Date('2023-12-13T10:30:00.000Z')
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetMetricsDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('userId');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('value');
      expect(result[0]).toHaveProperty('unit');
      expect(result[0]).toHaveProperty('originalUnit');
      expect(result[0]).toHaveProperty('timestamp');
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('createdAt');
    });
  });
});

