
import { Repository } from 'typeorm';
import { IMetricRepository } from '../../../domain/repositories/IMetricRepository';
import { Metric, MetricType } from '../../../domain/entities/Metric';
import { MetricEntity } from '../entities/MetricEntity';

export class MetricRepository implements IMetricRepository {
  constructor(private readonly ormRepository: Repository<MetricEntity>) {}

  async save(metric: Metric): Promise<Metric> {
    const entity = this.toEntity(metric);
    const saved = await this.ormRepository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string, userId: string): Promise<Metric | null> {
    const entity = await this.ormRepository.findOne({
      where: { id, userId },
    });
    
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserAndType(userId: string, type: string): Promise<Metric[]> {
    const entities = await this.ormRepository.find({
      where: { userId, type },
      order: { timestamp: 'DESC' },
    });
    
    return entities.map(e => this.toDomain(e));
  }

  async findByUserTypeAndTimeRange(
    userId: string,
    type: string,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<Metric[]> {
    const entities = await this.ormRepository
      .createQueryBuilder('metric')
      .where('metric.userId = :userId', { userId })
      .andWhere('metric.type = :type', { type })
      .andWhere('metric.timestamp >= :startTimestamp', { startTimestamp })
      .andWhere('metric.timestamp <= :endTimestamp', { endTimestamp })
      .orderBy('metric.timestamp', 'ASC')
      .getMany();
    
    return entities.map(e => this.toDomain(e));
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.ormRepository.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }

  private toEntity(metric: Metric): MetricEntity {
    const entity = new MetricEntity();
    entity.id = metric.id;
    entity.userId = metric.userId;
    entity.type = metric.type;
    entity.value = metric.value;
    entity.originalUnit = metric.originalUnit;
    entity.timestamp = metric.timestamp;
    entity.createdAt = metric.createdAt;
    return entity;
  }

  private toDomain(entity: MetricEntity): Metric {
    return new Metric(
      entity.id,
      entity.userId,
      entity.type as MetricType,
      Number(entity.value),
      entity.originalUnit as any,
      Number(entity.timestamp),
      entity.createdAt
    );
  }
}

