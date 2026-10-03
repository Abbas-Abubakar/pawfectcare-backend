import { Router } from 'express';
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  logout,
  refresh,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  loginLimiter,
  registerLimiter,
  otpLimiter,
  forgotPasswordLimiter,
} from '../middleware/rateLimiter.middleware.js';
import { validate } from '../middleware/validate.middlware.js';
import {
  registerValidator,
  loginValidator,
  verifyOtpValidator,
  resendOtpValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', registerLimiter, registerValidator, validate, register);
router.post('/verify-otp', otpLimiter, verifyOtpValidator, validate, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtpValidator, validate, resendOtp);
router.post('/login', loginLimiter, loginValidator, validate, login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, resetPassword);

export default router;