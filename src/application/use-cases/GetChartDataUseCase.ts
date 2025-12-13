import { Metric } from '../../domain/entities/Metric';
import { Timezone } from '../../domain/value-objects/Timezone';
import { Unit } from '../../domain/value-objects/Unit';
import { IMetricRepository } from '../../domain/repositories/IMetricRepository';
import { GetChartDataDTO, ChartDataResponseDTO } from '../dtos/MetricDTOs';
import { parse, addDays, format as formatDate } from 'date-fns';

export class GetChartDataUseCase {
  constructor(private readonly metricRepository: IMetricRepository) {}

  async execute(dto: GetChartDataDTO): Promise<ChartDataResponseDTO> {
    const timezone = new Timezone(dto.timezone);
    const targetUnit = dto.unit || Unit.getBaseUnit(dto.type);
    const unit = new Unit(targetUnit as any, dto.type);

    const startTimestamp = this.getStartOfDayTimestamp(dto.startDate, timezone);
    const endTimestamp = this.getEndOfDayTimestamp(dto.endDate, timezone);

    const metrics = await this.metricRepository.findByUserTypeAndTimeRange(
      dto.userId,
      dto.type,
      startTimestamp,
      endTimestamp
    );

    const metricsByDay = this.aggregateByDay(metrics, timezone);
    const allDates = this.getDateRange(dto.startDate, dto.endDate);

    const chartData = allDates.map(date => {
      const metric = metricsByDay.get(date);
      
      if (metric) {
        const convertedValue = unit.fromBaseUnit(metric.value);
        return {
          date,
          value: parseFloat(convertedValue.toFixed(6)),
          unit: targetUnit,
          timestamp: metric.timestamp,
        };
      }
      
      return {
        date,
        value: 0,
        unit: targetUnit,
        timestamp: this.getStartOfDayTimestamp(date, timezone),
      };
    });

    return {
      data: chartData,
      timezone: dto.timezone,
      startDate: dto.startDate,
      endDate: dto.endDate,
    };
  }

  private aggregateByDay(metrics: Metric[], timezone: Timezone): Map<string, Metric> {
    const metricsByDay = new Map<string, Metric>();

    for (const metric of metrics) {
      const dateString = timezone.getDateString(metric.timestamp);
      const existing = metricsByDay.get(dateString);

      if (!existing || metric.timestamp > existing.timestamp) {
        metricsByDay.set(dateString, metric);
      }
    }

    return metricsByDay;
  }

  private getDateRange(startDate: string, endDate: string): string[] {
    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());
    
    const dates: string[] = [];
    let currentDate = start;
    
    while (currentDate <= end) {
      dates.push(formatDate(currentDate, 'yyyy-MM-dd'));
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  }

  private getStartOfDayTimestamp(dateString: string, timezone: Timezone): number {
    return timezone.parseToUTC(`${dateString} 00:00:00`);
  }

  private getEndOfDayTimestamp(dateString: string, timezone: Timezone): number {
    return timezone.parseToUTC(`${dateString} 23:59:59`);
  }
}
