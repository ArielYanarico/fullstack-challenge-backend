import { z } from 'zod';

const validationSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test',]).default('development'),
  PORT: z.coerce.number().default(3000),
  PROVIDER_VEHICLES_URL: z.string().trim().min(1, {message: 'The url for vehicle api is required.' }),
  LOGGING_LEVEL: z.enum(['info', 'warn', 'error', 'debug']).default('info'),
  DB_CONNECTION_URI: z.string().default('mongodb://localhost:27017/challenge-db'),
  REDIS_HOST: z.string().trim().min(1).default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
})

export { validationSchema };
