import { Router } from 'express';
import { validateBody } from '../middleware/validate';
import { studentProfileSchema } from '../schemas';

export const recommendationsRouter = Router();

// TODO (Jeremie and Andile): load reference data via userClient(req.user.token),
// call recommend() from @beyond-tomorrow/engine, store a recommendation_runs row.
recommendationsRouter.post('/', validateBody(studentProfileSchema), (_req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});
