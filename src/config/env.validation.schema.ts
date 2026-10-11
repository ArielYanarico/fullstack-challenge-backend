import { z } from 'zod';

const validationSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test',]).default('development'),
  PORT: z.coerce.number().default(3000),
  PROVIDER_VEHICLES_URL: z.string().trim().min(1, {message: 'The url for vehicle provider is required.' }),
})

export { validationSchema };
