import { IsString, IsNumber, IsEnum, IsNotEmpty, Matches } from 'class-validator';
import { MetricType } from '../../domain/entities/Metric';

export class AddMetricDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(MetricType)
  @IsNotEmpty()
  type!: MetricType;

  @IsNumber()
  @IsNotEmpty()
  value!: number;

  @IsString()
  @IsNotEmpty()
  unit!: string;

  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z_]+\/[A-Za-z_]+$|^UTC$/, {
    message: 'Timezone must be in IANA format (e.g., America/New_York)',
  })
  timezone!: string;
}

export class GetMetricsDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(MetricType)
  @IsNotEmpty()
  type!: MetricType;

  @IsString()
  @IsNotEmpty()
  unit!: string;
}

export class GetChartDataDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(MetricType)
  @IsNotEmpty()
  type!: MetricType;

  @IsString()
  @IsNotEmpty()
  startDate!: string;

  @IsString()
  @IsNotEmpty()
  endDate!: string;

  @IsString()
  @IsNotEmpty()
  timezone!: string;

  @IsString()
  @IsNotEmpty()
  unit!: string;
}

export interface MetricResponseDTO {
  id: string;
  userId: string;
  type: string;
  value: number;
  unit: string;
  originalUnit: string;
  timestamp: number;
  date: string;
  createdAt: string;
}

export interface ChartDataResponseDTO {
  data: Array<{
    date: string;
    value: number;
    unit: string;
    timestamp: number;
  }>;
  timezone: string;
  startDate: string;
  endDate: string;
}
