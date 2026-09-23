import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { env } from './src/config/env.js';
import { globalErrorHandler } from './src/middleware/errorHandler.js';

import authRoutes from './src/routes/auth.routes.js'
import petRoutes from './src/routes/pet.routes.js'
import vetAvailabilityRoutes from './src/routes/vetAvailability.routes.js'
import appointmentRoutes from './src/routes/appointment.routes.js'

import healthRoutes from './src/routes/health.routes.js';
import AppError from './src/utils/appError.utils.js';

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
app.use('/api/auth', authRoutes)
app.use('/api/pets', petRoutes)
app.use('/api/availability', vetAvailabilityRoutes);
app.use('/api/appointments', appointmentRoutes);
// 404 + error handling (must be last)
app.all("/{*splat}", (req, res, next) => {
  const err = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(err);
});
app.use(globalErrorHandler);

export default app;