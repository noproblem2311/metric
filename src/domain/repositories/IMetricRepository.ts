import { Metric } from '../entities/Metric';

export interface IMetricRepository {
  save(metric: Metric): Promise<Metric>;
  findById(id: string, userId: string): Promise<Metric | null>;
  findByUserAndType(userId: string, type: string): Promise<Metric[]>;
  findByUserTypeAndTimeRange(
    userId: string,
    type: string,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<Metric[]>;
  delete(id: string, userId: string): Promise<boolean>;
}
