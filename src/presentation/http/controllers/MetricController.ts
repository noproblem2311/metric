import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AddMetricUseCase } from '../../../application/use-cases/AddMetricUseCase';
import { GetMetricsUseCase } from '../../../application/use-cases/GetMetricsUseCase';
import { GetChartDataUseCase } from '../../../application/use-cases/GetChartDataUseCase';
import {
    AddMetricDTO,
    GetMetricsDTO,
    GetChartDataDTO,
} from '../../../application/dtos/MetricDTOs';

export class MetricController {
  constructor(
    private readonly addMetricUseCase: AddMetricUseCase,
    private readonly getMetricsUseCase: GetMetricsUseCase,
    private readonly getChartDataUseCase: GetChartDataUseCase
  ) {}

  async addMetric(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(AddMetricDTO, req.body);
      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.map(e => ({
            property: e.property,
            constraints: e.constraints,
          })),
        });
        return;
      }

      const result = await this.addMetricUseCase.execute(dto);

      res.status(201).json({
        success: true,
        message: 'Metric added successfully',
        data: result,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(GetMetricsDTO, {
        userId: req.query.userId,
        type: req.query.type,
        unit: req.query.unit,
      } as Record<string, unknown>);

      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.map(e => ({
            property: e.property,
            constraints: e.constraints,
          })),
        });
        return;
      }

      const result = await this.getMetricsUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: 'Metrics retrieved successfully',
        data: result,
        count: result.length,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  async getChartData(req: Request, res: Response): Promise<void> {
    try {
      const dto = plainToClass(GetChartDataDTO, {
        userId: req.query.userId,
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        timezone: req.query.timezone,
        unit: req.query.unit,
      } as Record<string, unknown>);

      const errors = await validate(dto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.map(e => ({
            property: e.property,
            constraints: e.constraints,
          })),
        });
        return;
      }

      const result = await this.getChartDataUseCase.execute(dto);

      res.status(200).json({
        success: true,
        message: 'Chart data retrieved successfully',
        data: result,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: unknown): void {
    console.error('Error in MetricController:', error);

    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      if (message.includes('invalid') || 
          message.includes('timezone') ||
          message.includes('validation') ||
          message.includes('required')) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'An unexpected error occurred',
      });
    }
  }
}
