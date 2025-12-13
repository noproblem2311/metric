import { Metric } from '../../domain/entities/Metric';
import { Timezone } from '../../domain/value-objects/Timezone';
import { Unit } from '../../domain/value-objects/Unit';
import { IMetricRepository } from '../../domain/repositories/IMetricRepository';
import { AddMetricDTO, MetricResponseDTO } from '../dtos/MetricDTOs';
import { v4 as uuidv4 } from 'uuid';

export class AddMetricUseCase {
  constructor(private readonly metricRepository: IMetricRepository) {}

  async execute(dto: AddMetricDTO): Promise<MetricResponseDTO> {
    const timezone = new Timezone(dto.timezone);
    const unit = new Unit(dto.unit as any, dto.type);

    const baseValue = unit.toBaseUnit(dto.value);
    const timestamp = timezone.parseToUTC(dto.date);

    const metric = new Metric(
      uuidv4(),
      dto.userId,
      dto.type,
      baseValue,
      dto.unit as any,
      timestamp,
      new Date()
    );

    const savedMetric = await this.metricRepository.save(metric);

    const responseValue = unit.fromBaseUnit(savedMetric.value);
    const formattedDate = timezone.formatFromUTC(savedMetric.timestamp);

    return {
      id: savedMetric.id,
      userId: savedMetric.userId,
      type: savedMetric.type,
      value: parseFloat(responseValue.toFixed(6)),
      unit: dto.unit,
      originalUnit: savedMetric.originalUnit,
      timestamp: savedMetric.timestamp,
      date: formattedDate,
      createdAt: savedMetric.createdAt.toISOString(),
    };
  }
}
