import { Router } from 'express';
import { runCodeSnippet } from '../runner';
import { runRateLimiter } from '../middleware/rateLimiter';
import { problems } from '../mockData';

export const codingRouter = Router();

// Retrieve curated problems
codingRouter.get('/problems', (_req, res) => {
  res.json({ problems });
});

// Polyglot code execution endpoint
codingRouter.post('/run', runRateLimiter, async (req, res, next) => {
  try {
    const code = String(req.body.code || '');
    const language = String(req.body.language || 'js');
    const problemId = String(req.body.problemId || '');

    const result = await runCodeSnippet(code, language, problemId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
