import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';

import { env } from './src/config/env.js';
import { globalErrorHandler } from './src/middleware/errorHandler.js';
import { generalLimiter } from './src/middleware/rateLimiter.middleware.js';
import { sanitizeInput } from './src/middleware/sanitize.middleware.js';

import authRoutes from './src/routes/auth.routes.js'
import petRoutes from './src/routes/pet.routes.js'
import vetAvailabilityRoutes from './src/routes/vetAvailability.routes.js'
import appointmentRoutes from './src/routes/appointment.routes.js'
import productRoutes from './src/routes/product.routes.js'
import wishlistRoutes from './src/routes/wishlist.routes.js'
import bookmarkRoutes from './src/routes/bookmark.routes.js'
import blogPostRoutes from './src/routes/blogPost.routes.js'
import vetDashboardRoutes from './src/routes/vetDashboard.routes.js'
import adoptionListingRoutes from './src/routes/adoptionListing.routes.js';
import adoptionRequestRoutes from './src/routes/adoptionRequest.routes.js';
import successStoryRoutes from './src/routes/successStory.routes.js';
import contactMessageRoutes from './src/routes/contactMessage.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import userRoutes from './src/routes/user.routes.js';
import searchRoutes from './src/routes/search.routes.js';
import contactInfoRoutes from './src/routes/contactInfo.routes.js';
import AppError from './src/utils/appError.utils.js';
import healthRoutes from './src/routes/health.routes.js';

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
app.use(sanitizeInput);
app.use('/api', generalLimiter);

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
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/blog', blogPostRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/vet/dashboard', vetDashboardRoutes);
app.use('/api/adoptions', adoptionListingRoutes);
app.use('/api/adoptions', adoptionRequestRoutes);
app.use('/api/success-stories', successStoryRoutes);
app.use('/api/contact', contactMessageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/contact-info', contactInfoRoutes);
// 404 + error handling (must be last)
app.all("/{*splat}", (req, res, next) => {
  const err = new AppError(`Route not found: ${req.originalUrl}`, 404);
  next(err);
});
app.use(globalErrorHandler);

export default app;