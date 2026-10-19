import type { RequestHandler } from 'express';
import { userClient } from '../lib/supabase';

export interface AuthedUser { id: string; role: string | null; token: string }

declare module 'express-serve-static-core' {
  interface Request { user?: AuthedUser }
}

/** Verifies the Supabase access token on every protected request. */
export const requireUser: RequestHandler = async (req, res, next) => {
  try {
    const header = req.headers.authorization ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) return void res.status(401).json({ error: 'Unauthorised' });

    const { data, error } = await userClient(token).auth.getUser(token);
    if (error || !data.user) return void res.status(401).json({ error: 'Unauthorised' });

    // Role comes from app_metadata (users cannot edit it), never user_metadata.
    const role = (data.user.app_metadata as { role?: string } | undefined)?.role ?? null;
    req.user = { id: data.user.id, role, token };
    next();
  } catch (err) {
    next(err);
  }
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (req.user?.role !== 'admin') return void res.status(403).json({ error: 'Forbidden' });
  next();
};
