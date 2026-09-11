import { PrismaClient } from '@prisma/client';
import { config } from './config';

process.env.DATABASE_URL = config.databaseUrl;

export const prisma = new PrismaClient();

export let isDbConnected = false;

export async function bootstrapDatabase(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    return true;
  } catch (err: any) {
    isDbConnected = false;
    console.warn('Prisma bootstrap notice:', err?.message);
    return false;
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
