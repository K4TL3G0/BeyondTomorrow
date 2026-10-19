import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Not found' });
};

// Never leak stack traces or SQL to the client.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err instanceof Error ? err.message : 'Unknown error');
  res.status(500).json({ error: 'Something went wrong' });
};
