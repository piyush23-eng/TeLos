import type { Request, Response, NextFunction } from 'express';

export function createRateLimiter(options: { windowMs: number; max: number; message?: string }) {
  const requests = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.socket.remoteAddress) || '127.0.0.1';
    const now = Date.now();
    const windowStart = now - options.windowMs;

    const timestamps = (requests.get(ip) || []).filter(t => t > windowStart);
    if (timestamps.length >= options.max) {
      const retryAfter = Math.ceil((timestamps[0] + options.windowMs - now) / 1000);
      res.setHeader('Retry-After', Math.max(1, retryAfter));
      return res.status(429).json({
        error: options.message || 'Too many requests. Please slow down.',
        retryAfterSeconds: Math.max(1, retryAfter)
      });
    }

    timestamps.push(now);
    requests.set(ip, timestamps);

    if (requests.size > 5000) {
      for (const [key, list] of requests.entries()) {
        if (list.length === 0 || list[list.length - 1] < windowStart) {
          requests.delete(key);
        }
      }
    }

    next();
  };
}

export const runRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Code execution rate limit exceeded (max 20 executions/minute).'
});

export const interviewRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Interviewer query rate limit exceeded (max 60 queries/minute).'
});

export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too many authentication attempts. Please wait 1 minute before retrying.'
});
