import { Unit } from '../../domain/value-objects/Unit';
import { IMetricRepository } from '../../domain/repositories/IMetricRepository';
import { GetMetricsDTO, MetricResponseDTO } from '../dtos/MetricDTOs';

export class GetMetricsUseCase {
  constructor(private readonly metricRepository: IMetricRepository) {}

  async execute(dto: GetMetricsDTO): Promise<MetricResponseDTO[]> {
    const targetUnit = dto.unit || Unit.getBaseUnit(dto.type);
    const unit = new Unit(targetUnit as any, dto.type);

    const metrics = await this.metricRepository.findByUserAndType(dto.userId, dto.type);

    return metrics.map(metric => {
      const convertedValue = unit.fromBaseUnit(metric.value);
      
      return {
        id: metric.id,
        userId: metric.userId,
        type: metric.type,
        value: parseFloat(convertedValue.toFixed(6)),
        unit: targetUnit,
        originalUnit: metric.originalUnit,
        timestamp: metric.timestamp,
        date: new Date(metric.timestamp * 1000).toISOString(),
        createdAt: metric.createdAt.toISOString(),
      };
    });
  }
}
