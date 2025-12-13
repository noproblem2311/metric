import { AddMetricUseCase } from '../../../../src/application/use-cases/AddMetricUseCase';
import { IMetricRepository } from '../../../../src/domain/repositories/IMetricRepository';
import { Metric, MetricType, DistanceUnit, TemperatureUnit } from '../../../../src/domain/entities/Metric';
import { AddMetricDTO } from '../../../../src/application/dtos/MetricDTOs';

class MockMetricRepository implements IMetricRepository {
  async save(metric: Metric): Promise<Metric> {
    return metric;
  }

  async findById(_id: string, _userId: string): Promise<Metric | null> {
    return null;
  }

  async findByUserAndType(_userId: string, _type: MetricType): Promise<Metric[]> {
    return [];
  }

  async findByUserTypeAndTimeRange(
    _userId: string,
    _type: MetricType,
    _startTimestamp: number,
    _endTimestamp: number
  ): Promise<Metric[]> {
    return [];
  }

  async delete(_id: string, _userId: string): Promise<boolean> {
    return false;
  }
}

describe('AddMetricUseCase', () => {
  let useCase: AddMetricUseCase;
  let mockRepository: MockMetricRepository;

  beforeEach(() => {
    mockRepository = new MockMetricRepository();
    useCase = new AddMetricUseCase(mockRepository);
  });

  describe('Distance Metrics', () => {
    it('should add distance metric in meters', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const result = await useCase.execute(dto);

      expect(result.userId).toBe('user123');
      expect(result.type).toBe(MetricType.DISTANCE);
      expect(result.value).toBe(100);
      expect(result.unit).toBe(DistanceUnit.METER);
      expect(result.originalUnit).toBe(DistanceUnit.METER);
    });

    it('should add distance metric in centimeters and convert to base unit', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.CENTIMETER,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const saveSpy = jest.spyOn(mockRepository, 'save');
      const result = await useCase.execute(dto);

      expect(saveSpy).toHaveBeenCalled();
      const savedMetric = saveSpy.mock.calls[0][0];
      expect(savedMetric.value).toBe(1);
      expect(result.value).toBe(100);
      expect(result.unit).toBe(DistanceUnit.CENTIMETER);
    });

    it('should add distance metric in inches', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.INCH,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const result = await useCase.execute(dto);

      expect(result.value).toBe(100);
      expect(result.unit).toBe(DistanceUnit.INCH);
    });

    it('should add distance metric in feet', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.FEET,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const result = await useCase.execute(dto);

      expect(result.value).toBe(100);
      expect(result.unit).toBe(DistanceUnit.FEET);
    });

    it('should add distance metric in yards', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.YARD,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const result = await useCase.execute(dto);

      expect(result.value).toBe(100);
      expect(result.unit).toBe(DistanceUnit.YARD);
    });
  });

  describe('Temperature Metrics', () => {
    it('should add temperature metric in kelvin', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.TEMPERATURE,
        value: 273.15,
        unit: TemperatureUnit.KELVIN,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const result = await useCase.execute(dto);

      expect(result.userId).toBe('user123');
      expect(result.type).toBe(MetricType.TEMPERATURE);
      expect(result.value).toBe(273.15);
      expect(result.unit).toBe(TemperatureUnit.KELVIN);
    });

    it('should add temperature metric in celsius and convert to base unit', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.TEMPERATURE,
        value: 0,
        unit: TemperatureUnit.CELSIUS,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const saveSpy = jest.spyOn(mockRepository, 'save');
      const result = await useCase.execute(dto);

      expect(saveSpy).toHaveBeenCalled();
      const savedMetric = saveSpy.mock.calls[0][0];
      expect(savedMetric.value).toBe(273.15);
      expect(result.value).toBe(0);
      expect(result.unit).toBe(TemperatureUnit.CELSIUS);
    });

    it('should add temperature metric in fahrenheit and convert to base unit', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.TEMPERATURE,
        value: 32,
        unit: TemperatureUnit.FAHRENHEIT,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const saveSpy = jest.spyOn(mockRepository, 'save');
      const result = await useCase.execute(dto);

      expect(saveSpy).toHaveBeenCalled();
      const savedMetric = saveSpy.mock.calls[0][0];
      expect(savedMetric.value).toBeCloseTo(273.15, 2);
      expect(result.value).toBeCloseTo(32, 2);
      expect(result.unit).toBe(TemperatureUnit.FAHRENHEIT);
    });
  });

  describe('Timezone Handling', () => {
    it('should handle UTC timezone', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const result = await useCase.execute(dto);

      expect(result.date).toMatch(/2023-12-13/);
    });

    it('should handle America/New_York timezone', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'America/New_York',
      };

      const result = await useCase.execute(dto);

      expect(result.date).toMatch(/2023-12-13/);
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it('should handle Asia/Tokyo timezone', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'Asia/Tokyo',
      };

      const result = await useCase.execute(dto);

      expect(result.date).toMatch(/2023-12-13/);
      expect(result.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid unit', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: 'invalid' as any,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      await expect(useCase.execute(dto)).rejects.toThrow();
    });

    it('should throw error for invalid timezone', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'invalid-timezone',
      };

      await expect(useCase.execute(dto)).rejects.toThrow('Invalid IANA timezone format');
    });

    it('should throw error for invalid date', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: 'invalid-date',
        timezone: 'UTC',
      };

      await expect(useCase.execute(dto)).rejects.toThrow('Invalid date format');
    });
  });

  describe('Repository Integration', () => {
    it('should call repository save method', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const saveSpy = jest.spyOn(mockRepository, 'save');
      await useCase.execute(dto);

      expect(saveSpy).toHaveBeenCalledTimes(1);
      expect(saveSpy.mock.calls[0][0]).toBeInstanceOf(Metric);
    });

    it('should generate UUID for metric', async () => {
      const dto: AddMetricDTO = {
        userId: 'user123',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const result = await useCase.execute(dto);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });
  });
});

