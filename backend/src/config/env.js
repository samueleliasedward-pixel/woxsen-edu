import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Loading environment variables...');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

const config = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  apiPrefix: process.env.API_PREFIX || '/api',

  // Database
  DATABASE_URL: process.env.DATABASE_URL,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d',

  // Redis
  REDIS_URL: process.env.REDIS_URL,

  // Email
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,

  // Frontend
  FRONTEND_URL: process.env.FRONTEND_URL,

  // AI Service
  AI_SERVICE_URL: process.env.AI_SERVICE_URL,

  // File Upload
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 10485760,
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',

  // Rate Limiting
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100,

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

// Validate required config
if (!config.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined in environment variables');
  console.error('Current directory:', process.cwd());
  console.error('.env file path:', path.resolve(process.cwd(), '.env'));
  process.exit(1);
}

export default config;