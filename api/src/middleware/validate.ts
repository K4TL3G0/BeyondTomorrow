import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod/v3';

/** Rejects any body that does not match the schema; replaces it with the parsed value. */
export const validateBody =
  (schema: ZodTypeAny): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return void res.status(400).json({
        error: 'Invalid input',
        issues: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    req.body = result.data;
    next();
  };
