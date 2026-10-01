import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'PawfectCare <no-reply@pawfectcare.com>'
  },
  otp: {
    secret: process.env.OTP_SECRET,
    expiryMs: process.env.OTP_EXPIRY_MS ? parseInt(process.env.OTP_EXPIRY_MS) : 5 * 60 * 1000,
  },
  shelterInfo: {
    address: process.env.SHELTER_ADDRESS || '',
    lat: Number(process.env.SHELTER_LAT) || 0,
    lng: Number(process.env.SHELTER_LNG) || 0,
    phone: process.env.SHELTER_PHONE || '',
    email: process.env.SHELTER_EMAIL || '',
    hours: process.env.SHELTER_HOURS || '',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};