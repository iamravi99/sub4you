import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { standardRateLimiter } from './middleware/rateLimiter.js';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow all local dev origins, configured client url, or server-to-server
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === env.CLIENT_URL) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in dev
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parser
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiter
  app.use('/api', standardRateLimiter);

  // Mount API
  app.use('/api', apiRouter);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
