import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { env } from './src/config/env.js';
import { globalErrorHandler } from './src/middeware/errorHandler.js';
import healthRoutes from './src/routes/health.routes.js';
import AppError from './src/utils/appError.js';

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (env.nodeEnv === 'development') {
  // app.use(morgan('dev'));
}

// Routes
app.use('/api/health', healthRoutes);

// TODO: mount auth, pets, appointments, etc. routes here as we build them

// 404 + error handling (must be last)
app.all("/{*splat}", (req, res, next) => {
  return new AppError(`Route not found: ${req.originalUrl}`, 404)
})
app.use(globalErrorHandler);

export default app;