import express, { Application } from 'express';
import { DIContainer } from './infrastructure/di/Container';
import { createMetricRoutes } from './presentation/http/routes/metricRoutes';
import {
  requestLogger,
  corsMiddleware,
  errorHandler,
  notFoundHandler,
} from './presentation/http/middleware';

export function createApp(container: DIContainer): Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(corsMiddleware);
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      architecture: 'Clean Architecture',
    });
  });

  const metricController = container.getMetricController();
  const metricRoutes = createMetricRoutes(metricController);
  app.use('/api/metrics', metricRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
