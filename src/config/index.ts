export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'fallback_secret_key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

export const appConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};

export { connectDB } from './database';
