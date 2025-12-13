import { GetChartDataUseCase } from '../../../../src/application/use-cases/GetChartDataUseCase';
import { IMetricRepository } from '../../../../src/domain/repositories/IMetricRepository';
import { Metric, MetricType, DistanceUnit, TemperatureUnit } from '../../../../src/domain/entities/Metric';
import { GetChartDataDTO } from '../../../../src/application/dtos/MetricDTOs';

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

describe('GetChartDataUseCase', () => {
  let useCase: GetChartDataUseCase;
  let mockRepository: MockMetricRepository;

  beforeEach(() => {
    mockRepository = new MockMetricRepository();
    useCase = new GetChartDataUseCase(mockRepository);
  });

  describe('Chart Data Aggregation', () => {
    it('should return chart data for single day with one metric', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702425600,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-13',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].date).toBe('2023-12-13');
      expect(result.timezone).toBe('UTC');
    });

    it('should return latest metric when multiple metrics exist for same day', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702425600,
          new Date()
        ),
        new Metric(
          '123e4567-e89b-12d3-a456-426614174001',
          'user123',
          MetricType.DISTANCE,
          200,
          DistanceUnit.METER,
          1702429200,
          new Date()
        ),
        new Metric(
          '123e4567-e89b-12d3-a456-426614174002',
          'user123',
          MetricType.DISTANCE,
          150,
          DistanceUnit.METER,
          1702432800,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-13',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].value).toBe(150);
    });

    it('should return chart data for date range', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702425600,
          new Date()
        ),
        new Metric(
          '123e4567-e89b-12d3-a456-426614174001',
          'user123',
          MetricType.DISTANCE,
          200,
          DistanceUnit.METER,
          1702512000,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-14',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].date).toBe('2023-12-13');
      expect(result.data[1].date).toBe('2023-12-14');
    });

    it('should fill missing days with zero values', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702425600,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-15',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].value).toBe(100);
      expect(result.data[1].value).toBe(0);
      expect(result.data[2].value).toBe(0);
    });
  });

  describe('Unit Conversion', () => {
    it('should convert distance from meters to centimeters', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          1,
          DistanceUnit.METER,
          1702425600,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-13',
        timezone: 'UTC',
        unit: DistanceUnit.CENTIMETER,
      };

      const result = await useCase.execute(dto);

      expect(result.data[0].value).toBe(100);
      expect(result.data[0].unit).toBe(DistanceUnit.CENTIMETER);
    });

    it('should convert temperature from kelvin to celsius', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.TEMPERATURE,
          273.15,
          TemperatureUnit.KELVIN,
          1702425600,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.TEMPERATURE,
        startDate: '2023-12-13',
        endDate: '2023-12-13',
        timezone: 'UTC',
        unit: TemperatureUnit.CELSIUS,
      };

      const result = await useCase.execute(dto);

      expect(result.data[0].value).toBeCloseTo(0, 2);
      expect(result.data[0].unit).toBe(TemperatureUnit.CELSIUS);
    });

    it('should convert temperature from kelvin to fahrenheit', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.TEMPERATURE,
          273.15,
          TemperatureUnit.KELVIN,
          1702425600,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.TEMPERATURE,
        startDate: '2023-12-13',
        endDate: '2023-12-13',
        timezone: 'UTC',
        unit: TemperatureUnit.FAHRENHEIT,
      };

      const result = await useCase.execute(dto);

      expect(result.data[0].value).toBeCloseTo(32, 1);
      expect(result.data[0].unit).toBe(TemperatureUnit.FAHRENHEIT);
    });
  });

  describe('Timezone Handling', () => {
    it('should handle UTC timezone', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702425600,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-13',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result.timezone).toBe('UTC');
      expect(result.data[0].date).toBe('2023-12-13');
    });

    it('should handle America/New_York timezone', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702425600,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-13',
        timezone: 'America/New_York',
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result.timezone).toBe('America/New_York');
    });
  });

  describe('Response Format', () => {
    it('should return response with correct structure', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702425600,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-13',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('timezone');
      expect(result).toHaveProperty('startDate');
      expect(result).toHaveProperty('endDate');
      expect(result.data[0]).toHaveProperty('date');
      expect(result.data[0]).toHaveProperty('value');
      expect(result.data[0]).toHaveProperty('unit');
      expect(result.data[0]).toHaveProperty('timestamp');
    });
  });

  describe('Filter by User and Type', () => {
    it('should filter metrics by user', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702425600,
          new Date()
        ),
        new Metric(
          '123e4567-e89b-12d3-a456-426614174001',
          'user456',
          MetricType.DISTANCE,
          200,
          DistanceUnit.METER,
          1702429200,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-13',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result.data[0].value).toBe(100);
    });

    it('should filter metrics by type', async () => {
      const mockMetrics = [
        new Metric(
          '123e4567-e89b-12d3-a456-426614174000',
          'user123',
          MetricType.DISTANCE,
          100,
          DistanceUnit.METER,
          1702425600,
          new Date()
        ),
        new Metric(
          '123e4567-e89b-12d3-a456-426614174001',
          'user123',
          MetricType.TEMPERATURE,
          273.15,
          TemperatureUnit.KELVIN,
          1702429200,
          new Date()
        ),
      ];
      mockRepository.setMockData(mockMetrics);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-13',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result.data[0].value).toBe(100);
    });
  });

  describe('Empty Results', () => {
    it('should return zero values for all days when no metrics found', async () => {
      mockRepository.setMockData([]);

      const dto: GetChartDataDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-15',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      };

      const result = await useCase.execute(dto);

      expect(result.data).toHaveLength(3);
      expect(result.data[0].value).toBe(0);
      expect(result.data[1].value).toBe(0);
      expect(result.data[2].value).toBe(0);
    });
  });
});

