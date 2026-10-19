import { createClient } from '@supabase/supabase-js';
import { env } from '../config';

/** A client that acts AS the signed-in user, so Row Level Security still applies. */
export const userClient = (token: string) =>
  createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
