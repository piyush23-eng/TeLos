import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { Request, Response, NextFunction } from 'express';
import { prisma, isDbConnected } from '../lib/prisma';
import { config } from '../lib/config';

const scrypt = promisify(scryptCallback);

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  provider: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  experience?: string;
  projects?: string;
}

export const memoryUsers = new Map<string, StoredUser>();

export const userStore = {
  findByEmail: async (email: string): Promise<StoredUser | null> => {
    if (isDbConnected) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { email } });
        if (dbUser) return dbUser as StoredUser;
      } catch {
        // Prisma offline/schema fallback
      }
    }
    return memoryUsers.get(email.toLowerCase()) || null;
  },
  findById: async (id: string): Promise<StoredUser | null> => {
    if (isDbConnected) {
      try {
        const dbUser = await prisma.user.findUnique({ where: { id } });
        if (dbUser) return dbUser as StoredUser;
      } catch {
        // Prisma offline/schema fallback
      }
    }
    for (const u of memoryUsers.values()) {
      if (u.id === id) return u;
    }
    return null;
  },
  create: async (data: { name: string; email: string; passwordHash?: string; provider?: string }): Promise<StoredUser> => {
    const newUser: StoredUser = {
      id: randomBytes(12).toString('hex'),
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash || null,
      provider: data.provider || 'email',
      bio: '',
      linkedin: '',
      github: '',
      experience: '',
      projects: ''
    };
    if (isDbConnected) {
      try {
        const dbUser = await prisma.user.create({
          data: {
            name: data.name,
            email: data.email.toLowerCase(),
            passwordHash: data.passwordHash,
            provider: data.provider || 'email'
          }
        });
        if (dbUser) return dbUser as StoredUser;
      } catch {
        // Prisma schema push / lock fallback
      }
    }
    memoryUsers.set(newUser.email, newUser);
    return newUser;
  },
  update: async (id: string, data: Partial<StoredUser>): Promise<StoredUser | null> => {
    if (isDbConnected) {
      try {
        const updated = await prisma.user.update({ where: { id }, data });
        if (updated) return updated as StoredUser;
      } catch {
        // Prisma fallback
      }
    }
    for (const [em, u] of memoryUsers.entries()) {
      if (u.id === id) {
        const merged = { ...u, ...data };
        memoryUsers.set(em, merged);
        return merged;
      }
    }
    return null;
  }
};

export const makeToken = (user: { id: string; email: string }): string => {
  const payload = Buffer.from(JSON.stringify({ sub: user.id, email: user.email, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString('base64url');
  const signature = createHmac('sha256', config.sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

export const publicUser = (user: StoredUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  provider: user.provider,
  bio: user.bio || '',
  linkedin: user.linkedin || '',
  github: user.github || '',
  experience: user.experience || '',
  projects: user.projects || ''
});

export const passwordHash = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString('hex');
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${key.toString('hex')}`;
};

export const passwordMatches = async (password: string, stored: string): Promise<boolean> => {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = (await scrypt(password, salt, 64)) as Buffer;
  return timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
};

export const authenticatedUser = async (authorization?: string): Promise<StoredUser | null> => {
  const token = authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', config.sessionSecret).update(payload).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { sub?: string; exp?: number };
    if (!claims.sub || !claims.exp || claims.exp < Date.now()) return null;
    return await userStore.findById(claims.sub);
  } catch {
    return null;
  }
};

export interface AuthRequest extends Request {
  user?: StoredUser;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authenticatedUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
