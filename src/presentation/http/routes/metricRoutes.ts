
import { Router } from 'express';
import { MetricController } from '../controllers/MetricController';

export function createMetricRoutes(controller: MetricController): Router {
  const router = Router();

  router.post('/', (req, res) => controller.addMetric(req, res));
  router.get('/', (req, res) => controller.getMetrics(req, res));
  router.get('/chart', (req, res) => controller.getChartData(req, res));

  return router;
}

