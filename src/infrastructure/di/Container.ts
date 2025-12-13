import { Repository } from 'typeorm';
import { AppDataSource } from '../database/connection';
import { MetricEntity } from '../database/entities/MetricEntity';
import { MetricRepository } from '../database/repositories/MetricRepository';
import { IMetricRepository } from '../../domain/repositories/IMetricRepository';
import { AddMetricUseCase } from '../../application/use-cases/AddMetricUseCase';
import { GetMetricsUseCase } from '../../application/use-cases/GetMetricsUseCase';
import { GetChartDataUseCase } from '../../application/use-cases/GetChartDataUseCase';
import { MetricController } from '../../presentation/http/controllers/MetricController';

export class DIContainer {
  private metricRepository!: IMetricRepository;

  private addMetricUseCase!: AddMetricUseCase;
  private getMetricsUseCase!: GetMetricsUseCase;
  private getChartDataUseCase!: GetChartDataUseCase;

  private metricController!: MetricController;

  initialize(): void {
    const metricOrmRepository: Repository<MetricEntity> = 
      AppDataSource.getRepository(MetricEntity);
    this.metricRepository = new MetricRepository(metricOrmRepository);

    this.addMetricUseCase = new AddMetricUseCase(this.metricRepository);
    this.getMetricsUseCase = new GetMetricsUseCase(this.metricRepository);
    this.getChartDataUseCase = new GetChartDataUseCase(this.metricRepository);

    this.metricController = new MetricController(
      this.addMetricUseCase,
      this.getMetricsUseCase,
      this.getChartDataUseCase
    );

    console.log('Dependency Injection Container initialized');
  }

  getMetricController(): MetricController {
    if (!this.metricController) {
      throw new Error('DIContainer not initialized. Call initialize() first.');
    }
    return this.metricController;
  }

  getMetricRepository(): IMetricRepository {
    if (!this.metricRepository) {
      throw new Error('DIContainer not initialized. Call initialize() first.');
    }
    return this.metricRepository;
  }
}

export const container = new DIContainer();
