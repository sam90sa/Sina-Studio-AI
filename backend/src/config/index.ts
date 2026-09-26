/** Configuration management for the platform */
import { config as loadEnv } from 'dotenv';
loadEnv();

interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  host: string;
  apiVersion: string;
  apiPrefix: string;
  database: { url: string; poolSize: number; timeout: number };
  redis: { url: string; password?: string; timeout: number };
  jwt: { secret: string; expiry: string; bcryptRounds: number };
  cors: { origin: string[]; credentials: boolean };
  rateLimit: { windowMs: number; maxRequests: number };
  jobQueue: { name: string; maxAttempts: number; backoffDelay: number; timeout: number };
  storage: { type: 'local' | 's3' | 'gcs'; path?: string };
  providers: {
    agnes: { enabled: boolean; apiKey: string; apiUrl: string; timeout: number };
    openai: { enabled: boolean; apiKey: string };
    stability: { enabled: boolean; apiKey: string };
  };
  logging: { level: 'debug' | 'info' | 'warn' | 'error'; format: 'json' | 'text' };
}

const csv = (value: string | undefined, fallback: string[]): string[] =>
  value ? value.split(',').map((item) => item.trim()).filter(Boolean) : fallback;

const config_: AppConfig = {
  nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) || 'development',
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || '0.0.0.0',
  apiVersion: 'v1',
  apiPrefix: '/api',
  database: { url: process.env.DATABASE_URL || 'mongodb://localhost:27017/ai-platform', poolSize: Number(process.env.DATABASE_POOL_SIZE || 10), timeout: 30000 },
  redis: { url: process.env.REDIS_URL || 'redis://localhost:6379', password: process.env.REDIS_PASSWORD, timeout: 30000 },
  jwt: { secret: process.env.JWT_SECRET || 'dev-secret-key', expiry: process.env.JWT_EXPIRY || '7d', bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12) },
  cors: { origin: csv(process.env.CORS_ORIGIN, ['http://localhost:5173', 'http://localhost:8081']), credentials: true },
  rateLimit: { windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 900000), maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100) },
  jobQueue: { name: process.env.JOB_QUEUE_NAME || 'ai-tasks', maxAttempts: Number(process.env.JOB_MAX_ATTEMPTS || 3), backoffDelay: Number(process.env.JOB_BACKOFF_DELAY || 5000), timeout: Number(process.env.JOB_TIMEOUT || 300000) },
  storage: { type: (process.env.STORAGE_TYPE as AppConfig['storage']['type']) || 'local', path: process.env.STORAGE_PATH || '/tmp/ai-platform-storage' },
  providers: {
    agnes: { enabled: process.env.AGNES_ENABLED === 'true', apiKey: process.env.AGNES_API_KEY || '', apiUrl: process.env.AGNES_API_URL || 'https://api.agnes.ai', timeout: Number(process.env.AGNES_TIMEOUT || 300000) },
    openai: { enabled: process.env.OPENAI_ENABLED === 'true', apiKey: process.env.OPENAI_API_KEY || '' },
    stability: { enabled: process.env.STABILITY_ENABLED === 'true', apiKey: process.env.STABILITY_API_KEY || '' },
  },
  logging: { level: (process.env.LOG_LEVEL as AppConfig['logging']['level']) || 'info', format: (process.env.LOG_FORMAT as AppConfig['logging']['format']) || 'json' },
};

if (config_.nodeEnv === 'production' && config_.jwt.secret === 'dev-secret-key') throw new Error('JWT_SECRET must be set in production');
export default config_;
export type { AppConfig };
