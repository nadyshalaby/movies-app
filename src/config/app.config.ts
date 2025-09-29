import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || '1',
  swaggerEnabled: process.env.SWAGGER_ENABLED === 'true' || true,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  helmetEnabled: process.env.HELMET_ENABLED === 'true' || true,
  logLevel: process.env.LOG_LEVEL || 'info',
  logFileEnabled: process.env.LOG_FILE_ENABLED === 'true' || false,
  logFilePath: process.env.LOG_FILE_PATH || './logs/app.log',
}));