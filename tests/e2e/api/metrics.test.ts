import 'reflect-metadata';
import request from 'supertest';
import { Application } from 'express';
import { DataSource } from 'typeorm';
import { createApp } from '../../../src/app';
import { AppDataSource, initializeDatabase, closeDatabase } from '../../../src/infrastructure/database/connection';
import { container } from '../../../src/infrastructure/di/Container';
import { MetricType, DistanceUnit, TemperatureUnit } from '../../../src/domain/entities/Metric';

describe('Metrics API E2E Tests', () => {
  let app: Application;
  let dataSource: DataSource;

  beforeAll(async () => {
    await initializeDatabase();
    dataSource = AppDataSource;
    container.initialize();
    app = createApp(container);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await dataSource.query('DELETE FROM metrics');
  });

  describe('GET /health', () => {
    it('should return health check status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is running');
      expect(response.body.architecture).toBe('Clean Architecture');
    });
  });

  describe('POST /api/metrics', () => {
    it('should add a distance metric in meters', async () => {
      const payload = {
        userId: 'e2e-user-001',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const response = await request(app).post('/api/metrics').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe('e2e-user-001');
      expect(response.body.data.type).toBe(MetricType.DISTANCE);
      expect(response.body.data.value).toBe(100);
      expect(response.body.data.unit).toBe(DistanceUnit.METER);
      expect(response.body.data.id).toBeDefined();
    });

    it('should add a distance metric in centimeters', async () => {
      const payload = {
        userId: 'e2e-user-001',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.CENTIMETER,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const response = await request(app).post('/api/metrics').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.value).toBe(100);
      expect(response.body.data.unit).toBe(DistanceUnit.CENTIMETER);
    });

    it('should add a temperature metric in celsius', async () => {
      const payload = {
        userId: 'e2e-user-001',
        type: MetricType.TEMPERATURE,
        value: 25,
        unit: TemperatureUnit.CELSIUS,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const response = await request(app).post('/api/metrics').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe(MetricType.TEMPERATURE);
      expect(response.body.data.value).toBe(25);
      expect(response.body.data.unit).toBe(TemperatureUnit.CELSIUS);
    });

    it('should add a temperature metric in fahrenheit', async () => {
      const payload = {
        userId: 'e2e-user-001',
        type: MetricType.TEMPERATURE,
        value: 77,
        unit: TemperatureUnit.FAHRENHEIT,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const response = await request(app).post('/api/metrics').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.value).toBe(77);
      expect(response.body.data.unit).toBe(TemperatureUnit.FAHRENHEIT);
    });

    it('should handle timezone conversion for America/New_York', async () => {
      const payload = {
        userId: 'e2e-user-001',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'America/New_York',
      };

      const response = await request(app).post('/api/metrics').send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.date).toMatch(/2023-12-13/);
    });

    it('should return 400 for missing required fields', async () => {
      const payload = {
        userId: 'e2e-user-001',
        type: MetricType.DISTANCE,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const response = await request(app).post('/api/metrics').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid unit', async () => {
      const payload = {
        userId: 'e2e-user-001',
        type: MetricType.DISTANCE,
        value: 100,
        unit: 'invalid-unit',
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      };

      const response = await request(app).post('/api/metrics').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid timezone', async () => {
      const payload = {
        userId: 'e2e-user-001',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'Invalid/Timezone',
      };

      const response = await request(app).post('/api/metrics').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/metrics', () => {
    beforeEach(async () => {
      await request(app).post('/api/metrics').send({
        userId: 'e2e-user-002',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      });

      await request(app).post('/api/metrics').send({
        userId: 'e2e-user-002',
        type: MetricType.DISTANCE,
        value: 200,
        unit: DistanceUnit.METER,
        date: '2023-12-13 11:30:00',
        timezone: 'UTC',
      });

      await request(app).post('/api/metrics').send({
        userId: 'e2e-user-002',
        type: MetricType.TEMPERATURE,
        value: 25,
        unit: TemperatureUnit.CELSIUS,
        date: '2023-12-13 12:30:00',
        timezone: 'UTC',
      });
    });

    it('should get all distance metrics for a user', async () => {
      const response = await request(app).get('/api/metrics').query({
        userId: 'e2e-user-002',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.METER,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].type).toBe(MetricType.DISTANCE);
    });

    it('should get all temperature metrics for a user', async () => {
      const response = await request(app).get('/api/metrics').query({
        userId: 'e2e-user-002',
        type: MetricType.TEMPERATURE,
        unit: TemperatureUnit.CELSIUS,
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe(MetricType.TEMPERATURE);
    });

    it('should convert distance metrics to centimeters', async () => {
      const response = await request(app).get('/api/metrics').query({
        userId: 'e2e-user-002',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.CENTIMETER,
      });

      expect(response.status).toBe(200);
      expect(response.body.data[0].value).toBe(20000);
      expect(response.body.data[0].unit).toBe(DistanceUnit.CENTIMETER);
      expect(response.body.data[1].value).toBe(10000);
      expect(response.body.data[1].unit).toBe(DistanceUnit.CENTIMETER);
    });

    it('should convert temperature metrics to fahrenheit', async () => {
      const response = await request(app).get('/api/metrics').query({
        userId: 'e2e-user-002',
        type: MetricType.TEMPERATURE,
        unit: TemperatureUnit.FAHRENHEIT,
      });

      expect(response.status).toBe(200);
      expect(response.body.data[0].value).toBeCloseTo(77, 0);
      expect(response.body.data[0].unit).toBe(TemperatureUnit.FAHRENHEIT);
    });

    it('should return empty array for user with no metrics', async () => {
      const response = await request(app).get('/api/metrics').query({
        userId: 'non-existent-user',
        type: MetricType.DISTANCE,
        unit: DistanceUnit.METER,
      });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it('should return 400 for missing query parameters', async () => {
      const response = await request(app).get('/api/metrics').query({
        userId: 'e2e-user-002',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/metrics/chart', () => {
    beforeEach(async () => {
      await request(app).post('/api/metrics').send({
        userId: 'e2e-user-003',
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.METER,
        date: '2023-12-13 10:30:00',
        timezone: 'UTC',
      });

      await request(app).post('/api/metrics').send({
        userId: 'e2e-user-003',
        type: MetricType.DISTANCE,
        value: 200,
        unit: DistanceUnit.METER,
        date: '2023-12-13 14:30:00',
        timezone: 'UTC',
      });

      await request(app).post('/api/metrics').send({
        userId: 'e2e-user-003',
        type: MetricType.DISTANCE,
        value: 150,
        unit: DistanceUnit.METER,
        date: '2023-12-13 18:30:00',
        timezone: 'UTC',
      });

      await request(app).post('/api/metrics').send({
        userId: 'e2e-user-003',
        type: MetricType.DISTANCE,
        value: 300,
        unit: DistanceUnit.METER,
        date: '2023-12-14 10:30:00',
        timezone: 'UTC',
      });
    });

    it('should get chart data with latest metric per day', async () => {
      const response = await request(app).get('/api/metrics/chart').query({
        userId: 'e2e-user-003',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-14',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.data[0].date).toBe('2023-12-13');
      expect(response.body.data.data[0].value).toBe(150);
      expect(response.body.data.data[1].date).toBe('2023-12-14');
      expect(response.body.data.data[1].value).toBe(300);
    });

    it('should fill missing days with zero values', async () => {
      const response = await request(app).get('/api/metrics/chart').query({
        userId: 'e2e-user-003',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-16',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(4);
      expect(response.body.data.data[0].value).toBe(150);
      expect(response.body.data.data[1].value).toBe(300);
      expect(response.body.data.data[2].value).toBe(0);
      expect(response.body.data.data[3].value).toBe(0);
    });

    it('should convert chart data to centimeters', async () => {
      const response = await request(app).get('/api/metrics/chart').query({
        userId: 'e2e-user-003',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-14',
        timezone: 'UTC',
        unit: DistanceUnit.CENTIMETER,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.data[0].value).toBe(15000);
      expect(response.body.data.data[0].unit).toBe(DistanceUnit.CENTIMETER);
      expect(response.body.data.data[1].value).toBe(30000);
    });

    it('should return chart data with timezone information', async () => {
      const response = await request(app).get('/api/metrics/chart').query({
        userId: 'e2e-user-003',
        type: MetricType.DISTANCE,
        startDate: '2023-12-13',
        endDate: '2023-12-14',
        timezone: 'America/New_York',
        unit: DistanceUnit.METER,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.timezone).toBe('America/New_York');
      expect(response.body.data.startDate).toBe('2023-12-13');
      expect(response.body.data.endDate).toBe('2023-12-14');
    });

    it('should return 400 for missing query parameters', async () => {
      const response = await request(app).get('/api/metrics/chart').query({
        userId: 'e2e-user-003',
        type: MetricType.DISTANCE,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return all zero values for date range with no metrics', async () => {
      const response = await request(app).get('/api/metrics/chart').query({
        userId: 'non-existent-user',
        type: MetricType.DISTANCE,
        startDate: '2023-12-01',
        endDate: '2023-12-03',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.data).toHaveLength(3);
      expect(response.body.data.data.every((d: any) => d.value === 0)).toBe(true);
    });
  });

  describe('Integration Tests - Full User Journey', () => {
    it('should support complete metric tracking workflow', async () => {
      const userId = 'e2e-user-004';

      const metric1 = await request(app).post('/api/metrics').send({
        userId,
        type: MetricType.DISTANCE,
        value: 5,
        unit: DistanceUnit.YARD,
        date: '2023-12-10 09:00:00',
        timezone: 'UTC',
      });
      expect(metric1.status).toBe(201);

      const metric2 = await request(app).post('/api/metrics').send({
        userId,
        type: MetricType.DISTANCE,
        value: 10,
        unit: DistanceUnit.FEET,
        date: '2023-12-11 09:00:00',
        timezone: 'UTC',
      });
      expect(metric2.status).toBe(201);

      const metric3 = await request(app).post('/api/metrics').send({
        userId,
        type: MetricType.DISTANCE,
        value: 100,
        unit: DistanceUnit.INCH,
        date: '2023-12-12 09:00:00',
        timezone: 'UTC',
      });
      expect(metric3.status).toBe(201);

      const allMetrics = await request(app).get('/api/metrics').query({
        userId,
        type: MetricType.DISTANCE,
        unit: DistanceUnit.METER,
      });
      expect(allMetrics.status).toBe(200);
      expect(allMetrics.body.data).toHaveLength(3);

      const chartData = await request(app).get('/api/metrics/chart').query({
        userId,
        type: MetricType.DISTANCE,
        startDate: '2023-12-10',
        endDate: '2023-12-12',
        timezone: 'UTC',
        unit: DistanceUnit.METER,
      });
      expect(chartData.status).toBe(200);
      expect(chartData.body.data.data).toHaveLength(3);
      expect(chartData.body.data.data[0].value).toBeCloseTo(4.572, 2);
      expect(chartData.body.data.data[1].value).toBeCloseTo(3.048, 2);
      expect(chartData.body.data.data[2].value).toBeCloseTo(2.54, 2);
    });

    it('should support temperature tracking with multiple units', async () => {
      const userId = 'e2e-user-005';

      await request(app).post('/api/metrics').send({
        userId,
        type: MetricType.TEMPERATURE,
        value: 0,
        unit: TemperatureUnit.CELSIUS,
        date: '2023-12-10 09:00:00',
        timezone: 'UTC',
      });

      await request(app).post('/api/metrics').send({
        userId,
        type: MetricType.TEMPERATURE,
        value: 32,
        unit: TemperatureUnit.FAHRENHEIT,
        date: '2023-12-11 09:00:00',
        timezone: 'UTC',
      });

      await request(app).post('/api/metrics').send({
        userId,
        type: MetricType.TEMPERATURE,
        value: 273.15,
        unit: TemperatureUnit.KELVIN,
        date: '2023-12-12 09:00:00',
        timezone: 'UTC',
      });

      const allMetrics = await request(app).get('/api/metrics').query({
        userId,
        type: MetricType.TEMPERATURE,
        unit: TemperatureUnit.CELSIUS,
      });
      expect(allMetrics.status).toBe(200);
      expect(allMetrics.body.data).toHaveLength(3);
      expect(allMetrics.body.data.every((m: any) => Math.abs(m.value) < 1)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/metrics')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });
});

