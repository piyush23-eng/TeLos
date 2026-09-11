import { PrismaClient } from '@prisma/client';
import { config } from './config';

process.env.DATABASE_URL = config.databaseUrl;

export const prisma = new PrismaClient();

export async function bootstrapDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: any) {
    console.warn('Prisma bootstrap notice:', err?.message);
  }
}

// Periodic database keep-alive ping every 6 hours while server is active
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    // silent catch to maintain uptime
  }
}, 1000 * 60 * 60 * 6);
