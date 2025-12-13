import { Repository } from 'typeorm';
import { MetricRepository } from '../../../../src/infrastructure/database/repositories/MetricRepository';
import { MetricEntity } from '../../../../src/infrastructure/database/entities/MetricEntity';
import { Metric, MetricType, DistanceUnit, TemperatureUnit } from '../../../../src/domain/entities/Metric';

class MockOrmRepository {
  private data: MetricEntity[] = [];

  async save(entity: MetricEntity): Promise<MetricEntity> {
    const existing = this.data.findIndex(e => e.id === entity.id);
    if (existing >= 0) {
      this.data[existing] = entity;
    } else {
      this.data.push(entity);
    }
    return entity;
  }

  async findOne(options: any): Promise<MetricEntity | null> {
    const found = this.data.find(
      e => e.id === options.where.id && e.userId === options.where.userId
    );
    return found || null;
  }

  async find(options: any): Promise<MetricEntity[]> {
    let result = this.data.filter(
      e => e.userId === options.where.userId && e.type === options.where.type
    );
    
    if (options.order?.timestamp === 'DESC') {
      result.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    }
    
    return result;
  }

  createQueryBuilder(_alias: string): any {
    const conditions: any = {};
    const builder = {
      where: (_condition: string, params: any) => {
        Object.assign(conditions, params);
        return builder;
      },
      andWhere: (_condition: string, params: any) => {
        Object.assign(conditions, params);
        return builder;
      },
      orderBy: (_field: string, _direction: string) => {
        return builder;
      },
      getMany: async (): Promise<MetricEntity[]> => {
        let result = this.data.filter(e => {
          if (conditions.userId && e.userId !== conditions.userId) return false;
          if (conditions.type && e.type !== conditions.type) return false;
          if (conditions.startTimestamp && Number(e.timestamp) < conditions.startTimestamp) return false;
          if (conditions.endTimestamp && Number(e.timestamp) > conditions.endTimestamp) return false;
          return true;
        });
        
        result.sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
        return result;
      },
    };
    return builder;
  }

  async delete(criteria: any): Promise<any> {
    const index = this.data.findIndex(
      e => e.id === criteria.id && e.userId === criteria.userId
    );
    
    if (index >= 0) {
      this.data.splice(index, 1);
      return { affected: 1 };
    }
    
    return { affected: 0 };
  }

  setMockData(data: MetricEntity[]): void {
    this.data = [...data];
  }

  clear(): void {
    this.data = [];
  }
}

describe('MetricRepository', () => {
  let repository: MetricRepository;
  let mockOrmRepository: MockOrmRepository;

  beforeEach(() => {
    mockOrmRepository = new MockOrmRepository();
    repository = new MetricRepository(mockOrmRepository as unknown as Repository<MetricEntity>);
  });

  afterEach(() => {
    mockOrmRepository.clear();
  });

  describe('save', () => {
    it('should save a distance metric', async () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date('2023-12-13T10:30:00.000Z')
      );

      const result = await repository.save(metric);

      expect(result.id).toBe(metric.id);
      expect(result.userId).toBe(metric.userId);
      expect(result.type).toBe(metric.type);
      expect(result.value).toBe(metric.value);
      expect(result.originalUnit).toBe(metric.originalUnit);
    });

    it('should save a temperature metric', async () => {
      const metric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.TEMPERATURE,
        273.15,
        TemperatureUnit.KELVIN,
        1702468200,
        new Date('2023-12-13T10:30:00.000Z')
      );

      const result = await repository.save(metric);

      expect(result.type).toBe(MetricType.TEMPERATURE);
      expect(result.value).toBe(273.15);
    });

    it('should update existing metric', async () => {
      const metric1 = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100,
        DistanceUnit.METER,
        1702468200,
        new Date('2023-12-13T10:30:00.000Z')
      );

      await repository.save(metric1);

      const metric2 = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        200,
        DistanceUnit.METER,
        1702468300,
        new Date('2023-12-13T10:30:00.000Z')
      );

      const result = await repository.save(metric2);

      expect(result.value).toBe(200);
    });
  });

  describe('findById', () => {
    it('should find metric by id and userId', async () => {
      const entity = new MetricEntity();
      entity.id = '123e4567-e89b-12d3-a456-426614174000';
      entity.userId = 'user123';
      entity.type = MetricType.DISTANCE;
      entity.value = 100;
      entity.originalUnit = DistanceUnit.METER;
      entity.timestamp = 1702468200;
      entity.createdAt = new Date('2023-12-13T10:30:00.000Z');

      mockOrmRepository.setMockData([entity]);

      const result = await repository.findById('123e4567-e89b-12d3-a456-426614174000', 'user123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe(entity.id);
      expect(result?.userId).toBe(entity.userId);
    });

    it('should return null when metric not found', async () => {
      mockOrmRepository.setMockData([]);

      const result = await repository.findById('non-existent-id', 'user123');

      expect(result).toBeNull();
    });

    it('should return null when userId does not match', async () => {
      const entity = new MetricEntity();
      entity.id = '123e4567-e89b-12d3-a456-426614174000';
      entity.userId = 'user123';
      entity.type = MetricType.DISTANCE;
      entity.value = 100;
      entity.originalUnit = DistanceUnit.METER;
      entity.timestamp = 1702468200;
      entity.createdAt = new Date('2023-12-13T10:30:00.000Z');

      mockOrmRepository.setMockData([entity]);

      const result = await repository.findById('123e4567-e89b-12d3-a456-426614174000', 'user456');

      expect(result).toBeNull();
    });
  });

  describe('findByUserAndType', () => {
    it('should find all distance metrics for a user', async () => {
      const entity1 = new MetricEntity();
      entity1.id = '123e4567-e89b-12d3-a456-426614174000';
      entity1.userId = 'user123';
      entity1.type = MetricType.DISTANCE;
      entity1.value = 100;
      entity1.originalUnit = DistanceUnit.METER;
      entity1.timestamp = 1702468200;
      entity1.createdAt = new Date();

      const entity2 = new MetricEntity();
      entity2.id = '123e4567-e89b-12d3-a456-426614174001';
      entity2.userId = 'user123';
      entity2.type = MetricType.DISTANCE;
      entity2.value = 200;
      entity2.originalUnit = DistanceUnit.METER;
      entity2.timestamp = 1702468300;
      entity2.createdAt = new Date();

      mockOrmRepository.setMockData([entity1, entity2]);

      const result = await repository.findByUserAndType('user123', MetricType.DISTANCE);

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(200);
      expect(result[1].value).toBe(100);
    });

    it('should filter by metric type', async () => {
      const entity1 = new MetricEntity();
      entity1.id = '123e4567-e89b-12d3-a456-426614174000';
      entity1.userId = 'user123';
      entity1.type = MetricType.DISTANCE;
      entity1.value = 100;
      entity1.originalUnit = DistanceUnit.METER;
      entity1.timestamp = 1702468200;
      entity1.createdAt = new Date();

      const entity2 = new MetricEntity();
      entity2.id = '123e4567-e89b-12d3-a456-426614174001';
      entity2.userId = 'user123';
      entity2.type = MetricType.TEMPERATURE;
      entity2.value = 273.15;
      entity2.originalUnit = TemperatureUnit.KELVIN;
      entity2.timestamp = 1702468300;
      entity2.createdAt = new Date();

      mockOrmRepository.setMockData([entity1, entity2]);

      const result = await repository.findByUserAndType('user123', MetricType.DISTANCE);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe(MetricType.DISTANCE);
    });

    it('should return empty array when no metrics found', async () => {
      mockOrmRepository.setMockData([]);

      const result = await repository.findByUserAndType('user123', MetricType.DISTANCE);

      expect(result).toEqual([]);
    });
  });

  describe('findByUserTypeAndTimeRange', () => {
    it('should find metrics within time range', async () => {
      const entity1 = new MetricEntity();
      entity1.id = '123e4567-e89b-12d3-a456-426614174000';
      entity1.userId = 'user123';
      entity1.type = MetricType.DISTANCE;
      entity1.value = 100;
      entity1.originalUnit = DistanceUnit.METER;
      entity1.timestamp = 1702468200;
      entity1.createdAt = new Date();

      const entity2 = new MetricEntity();
      entity2.id = '123e4567-e89b-12d3-a456-426614174001';
      entity2.userId = 'user123';
      entity2.type = MetricType.DISTANCE;
      entity2.value = 200;
      entity2.originalUnit = DistanceUnit.METER;
      entity2.timestamp = 1702468300;
      entity2.createdAt = new Date();

      const entity3 = new MetricEntity();
      entity3.id = '123e4567-e89b-12d3-a456-426614174002';
      entity3.userId = 'user123';
      entity3.type = MetricType.DISTANCE;
      entity3.value = 300;
      entity3.originalUnit = DistanceUnit.METER;
      entity3.timestamp = 1702468400;
      entity3.createdAt = new Date();

      mockOrmRepository.setMockData([entity1, entity2, entity3]);

      const result = await repository.findByUserTypeAndTimeRange(
        'user123',
        MetricType.DISTANCE,
        1702468200,
        1702468300
      );

      expect(result).toHaveLength(2);
      expect(result[0].value).toBe(100);
      expect(result[1].value).toBe(200);
    });

    it('should return metrics in ascending order by timestamp', async () => {
      const entity1 = new MetricEntity();
      entity1.id = '123e4567-e89b-12d3-a456-426614174000';
      entity1.userId = 'user123';
      entity1.type = MetricType.DISTANCE;
      entity1.value = 100;
      entity1.originalUnit = DistanceUnit.METER;
      entity1.timestamp = 1702468300;
      entity1.createdAt = new Date();

      const entity2 = new MetricEntity();
      entity2.id = '123e4567-e89b-12d3-a456-426614174001';
      entity2.userId = 'user123';
      entity2.type = MetricType.DISTANCE;
      entity2.value = 200;
      entity2.originalUnit = DistanceUnit.METER;
      entity2.timestamp = 1702468200;
      entity2.createdAt = new Date();

      mockOrmRepository.setMockData([entity1, entity2]);

      const result = await repository.findByUserTypeAndTimeRange(
        'user123',
        MetricType.DISTANCE,
        1702468100,
        1702468400
      );

      expect(result).toHaveLength(2);
      expect(result[0].timestamp).toBe(1702468200);
      expect(result[1].timestamp).toBe(1702468300);
    });

    it('should return empty array when no metrics in range', async () => {
      mockOrmRepository.setMockData([]);

      const result = await repository.findByUserTypeAndTimeRange(
        'user123',
        MetricType.DISTANCE,
        1702468200,
        1702468300
      );

      expect(result).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should delete metric by id and userId', async () => {
      const entity = new MetricEntity();
      entity.id = '123e4567-e89b-12d3-a456-426614174000';
      entity.userId = 'user123';
      entity.type = MetricType.DISTANCE;
      entity.value = 100;
      entity.originalUnit = DistanceUnit.METER;
      entity.timestamp = 1702468200;
      entity.createdAt = new Date();

      mockOrmRepository.setMockData([entity]);

      const result = await repository.delete('123e4567-e89b-12d3-a456-426614174000', 'user123');

      expect(result).toBe(true);
    });

    it('should return false when metric not found', async () => {
      mockOrmRepository.setMockData([]);

      const result = await repository.delete('non-existent-id', 'user123');

      expect(result).toBe(false);
    });

    it('should return false when userId does not match', async () => {
      const entity = new MetricEntity();
      entity.id = '123e4567-e89b-12d3-a456-426614174000';
      entity.userId = 'user123';
      entity.type = MetricType.DISTANCE;
      entity.value = 100;
      entity.originalUnit = DistanceUnit.METER;
      entity.timestamp = 1702468200;
      entity.createdAt = new Date();

      mockOrmRepository.setMockData([entity]);

      const result = await repository.delete('123e4567-e89b-12d3-a456-426614174000', 'user456');

      expect(result).toBe(false);
    });
  });

  describe('Domain-Entity Conversion', () => {
    it('should correctly convert metric to entity and back', async () => {
      const originalMetric = new Metric(
        '123e4567-e89b-12d3-a456-426614174000',
        'user123',
        MetricType.DISTANCE,
        100.5,
        DistanceUnit.METER,
        1702468200,
        new Date('2023-12-13T10:30:00.000Z')
      );

      const saved = await repository.save(originalMetric);

      expect(saved.id).toBe(originalMetric.id);
      expect(saved.userId).toBe(originalMetric.userId);
      expect(saved.type).toBe(originalMetric.type);
      expect(saved.value).toBe(originalMetric.value);
      expect(saved.originalUnit).toBe(originalMetric.originalUnit);
      expect(saved.timestamp).toBe(originalMetric.timestamp);
    });
  });
});

