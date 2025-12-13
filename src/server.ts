
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { createApp } from './app';
import { initializeDatabase, closeDatabase } from './infrastructure/database/connection';
import { container } from './infrastructure/di/Container';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap(): Promise<void> {
  try {
    console.log('Starting Everfit Metric Tracking System');
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);

    await initializeDatabase();

    container.initialize();

    const app = createApp(container);

    const server = app.listen(PORT, HOST, () => {
      console.log(` Server is running on http://${HOST}:${PORT}`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down ...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          await closeDatabase();
          console.log('shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error('Forced shutdown due to timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled Promise Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();

