import rateLimit from 'express-rate-limit';

/**
 * General baseline limiter applied to all API routes — generous enough
 * not to interfere with normal usage, just a safety net against gross abuse.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per window
  standardHeaders: true, // return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

/**
 * Strict limiter for login — the classic brute-force target.
 * Low limit since a real user rarely fails login more than a few times.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed logins count toward the limit
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
});

/**
 * Limiter for registration — prevents mass fake-account creation.
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many accounts created from this IP. Please try again later.',
  },
});

/**
 * Limiter for OTP verify/resend — prevents brute-forcing a 6-digit code
 * and prevents OTP-spam (repeatedly triggering resend to flood someone's inbox).
 */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // generous enough for legitimate retries/resends, tight enough to block brute force
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many OTP attempts. Please wait before trying again.',
  },
});

/**
 * Limiter for forgot-password — prevents email-bombing a victim's inbox
 * and prevents using it as a user-enumeration probe at scale.
 */
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again later.',
  },
});