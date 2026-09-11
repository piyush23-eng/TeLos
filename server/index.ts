import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { config } from './lib/config';
import { prisma, bootstrapDatabase } from './lib/prisma';
import { authRouter } from './routes/auth.routes';
import { interviewRouter, intelligence } from './routes/interview.routes';
import { codingRouter } from './routes/coding.routes';
import { communityRouter } from './routes/community.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
void bootstrapDatabase();

// System Health & Diagnostics
app.get('/health', async (_req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'fallback';
  }
  res.json({
    status: 'ok',
    database: dbStatus,
    mode: intelligence.mode,
    llm: intelligence.llm,
    deepgram: Boolean(config.deepgramApiKey)
  });
});

// Domain API Routers
app.use('/api/auth', authRouter);
app.use('/api/interviewer', interviewRouter);
app.use('/api/interview', interviewRouter);
app.use('/api', interviewRouter); // mounts /api/classify, /api/personas, /api/report, /api/tts
app.use('/api', codingRouter);    // mounts /api/problems, /api/run
app.use('/api/community', communityRouter);
app.use('/api/analytics', analyticsRouter);

// Serve static frontend build if dist/ exists (production monolith / container mode)
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Centralized Error Handling Middleware
app.use(errorHandler);

// Start server
app.listen(config.port, '0.0.0.0', () => {
  console.log(`TeLos API listening on port ${config.port}`);
});

export default app;
