import { Router } from 'express';
import { demoSessions } from '../mockData';

export const analyticsRouter = Router();

// Retrieve candidate analytics sessions
analyticsRouter.get('/', (_req, res) => {
  res.json({ sessions: demoSessions });
});
