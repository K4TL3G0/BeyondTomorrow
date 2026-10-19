import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().int().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Log which variables are wrong, never their values.
  console.error('Invalid environment:', Object.keys(parsed.error.flatten().fieldErrors));
  process.exit(1);
}

export const env = {
  ...parsed.data,
  origins: parsed.data.ALLOWED_ORIGINS.split(',').map((s) => s.trim()),
};
