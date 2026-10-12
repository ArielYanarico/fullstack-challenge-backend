import { z } from 'zod';

const validationSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test',]).default('development'),
  PORT: z.coerce.number().default(3000),
  PROVIDER_VEHICLES_URL: z.string().trim().min(1, {message: 'The url for vehicle api is required.' }),
  LOGGING_LEVEL: z.enum(['info', 'warn', 'error', 'debug']).default('info'),
  DB_CONNECTION_URI: z.string().default('mongodb://localhost:27017/challenge-db'),
})

export { validationSchema };
