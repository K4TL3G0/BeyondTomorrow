import { Router } from 'express';
import { userClient } from '../lib/supabase';

export const adminRouter = Router();

// Calls the admin-only SQL function with the admin's own token, so the
// database performs the authorisation check as well (defence in depth).
adminRouter.get('/stats', async (req, res, next) => {
  try {
    if (!req.user) return void res.status(401).json({ error: 'Unauthorised' });
    const { data, error } = await userClient(req.user.token).rpc('traction_stats');
    if (error) return void res.status(403).json({ error: 'Forbidden' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});
