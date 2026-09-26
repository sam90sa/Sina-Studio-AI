import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger from './utils/logger';

import authRoutes from './api/routes/auth';
import jobRoutes from './api/routes/jobs';
import userRoutes from './api/routes/users';
import projectRoutes from './api/routes/projects';
import generateRoutes from './api/routes/generate';

export function createApp(): Express {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(compression());

  if (config.nodeEnv !== 'test') {
    app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
  }

  app.use('/api/', rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  }));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use(`${config.apiPrefix}/${config.apiVersion}/auth`, authRoutes);
  app.use(`${config.apiPrefix}/${config.apiVersion}/jobs`, jobRoutes);
  app.use(`${config.apiPrefix}/${config.apiVersion}/users`, userRoutes);
  app.use(`${config.apiPrefix}/${config.apiVersion}/projects`, projectRoutes);
  app.use(`${config.apiPrefix}/${config.apiVersion}/generate`, generateRoutes);

  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found', message: `Route ${req.path} not found`, statusCode: 404 });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Unhandled error', err);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
      error: err.name || 'Error',
      message: err.message || 'Internal Server Error',
      statusCode,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  });

  return app;
}

export default createApp();
