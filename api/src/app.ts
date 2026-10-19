import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config';
import { requireAdmin, requireUser } from './middleware/auth';
import { errorHandler, notFound } from './middleware/errors';
import { generalLimiter, strictLimiter } from './middleware/rateLimit';
import { adminRouter } from './routes/admin';
import { healthRouter } from './routes/health';
import { recommendationsRouter } from './routes/recommendations';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // correct client IPs for rate limiting behind a host proxy
app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || env.origins.includes(origin) ? cb(null, true) : cb(new Error('Origin not allowed')),
  }),
);
app.use(express.json({ limit: '50kb' }));
app.use(generalLimiter);

app.use('/health', healthRouter);
app.use('/api/recommendations', requireUser, strictLimiter, recommendationsRouter);
app.use('/api/admin', requireUser, requireAdmin, adminRouter);

app.use(notFound);
app.use(errorHandler);
