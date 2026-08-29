import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaClient } from '@prisma/client';
import { demoSessions, personas, problems } from './mockData';
import { IntelligenceProvider } from './intelligence';
import { runCodeSnippet } from './runner';

const app = express();
app.use(cors()); app.use(express.json());

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/telos?schema=public';
const intelligence = new IntelligenceProvider();
const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);
const sessionSecret = process.env.AUTH_SESSION_SECRET || 'telos-development-secret-change-me';

// Resilient in-memory user cache to guarantee zero downtime even if DB is initializing
interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string | null;
  provider: string;
  bio: string;
  linkedin: string;
  github: string;
  experience: string;
  projects: string;
}
const memoryUsers = new Map<string, StoredUser>();

// Database bootstrap helper
async function bootstrapDatabase() {
  try {
    await prisma.$connect();
  } catch (err: any) {
    console.warn('Prisma bootstrap notice:', err?.message);
  }
}
void bootstrapDatabase();

const userStore = {
  findByEmail: async (email: string): Promise<StoredUser | null> => {
    try {
      const dbUser = await prisma.user.findUnique({ where: { email } });
      if (dbUser) return dbUser as StoredUser;
    } catch {
      // Prisma offline/schema fallback
    }
    return memoryUsers.get(email.toLowerCase()) || null;
  },
  findById: async (id: string): Promise<StoredUser | null> => {
    try {
      const dbUser = await prisma.user.findUnique({ where: { id } });
      if (dbUser) return dbUser as StoredUser;
    } catch {
      // Prisma offline/schema fallback
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
    try {
      const dbUser = await prisma.user.create({ data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        provider: data.provider || 'email'
      } });
      if (dbUser) return dbUser as StoredUser;
    } catch {
      // Prisma schema push / lock fallback
    }
    memoryUsers.set(newUser.email, newUser);
    return newUser;
  },
  update: async (id: string, data: Partial<StoredUser>): Promise<StoredUser | null> => {
    try {
      const updated = await prisma.user.update({ where: { id }, data });
      if (updated) return updated as StoredUser;
    } catch {
      // Prisma fallback
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

const makeToken = (user: { id: string; email: string }) => {
  const payload = Buffer.from(JSON.stringify({ sub: user.id, email: user.email, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};
const publicUser = (user: StoredUser) => ({
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
const passwordHash = async (password: string) => { const salt = randomBytes(16).toString('hex'); const key = await scrypt(password, salt, 64) as Buffer; return `${salt}:${key.toString('hex')}`; };
const passwordMatches = async (password: string, stored: string) => { const [salt, hash] = stored.split(':'); if (!salt || !hash) return false; const candidate = await scrypt(password, salt, 64) as Buffer; return timingSafeEqual(candidate, Buffer.from(hash, 'hex')); };
const authenticatedUser = async (authorization?: string) => {
  const token = authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { sub?: string; exp?: number };
    if (!claims.sub || !claims.exp || claims.exp < Date.now()) return null;
    return await userStore.findById(claims.sub);
  } catch { return null; }
};

const communityPosts: any[] = [
  {
    id: 'post-1',
    author: 'Priya S.',
    company: 'Google',
    role: 'L5 Backend Engineer',
    time: '2 hours ago',
    type: 'debrief',
    title: 'Cleared Google L5 Technical & System Design Rounds — Key Takeaways',
    message: 'Just received the positive HC signal for Google MTV! For system design, Alex’s advice on calculating throughput before writing down any database schemas saved me. When asked to scale an API rate limiter, I immediately led with token bucket + Redis Lua scripts + P99 latency bounds.',
    upvotes: 42,
    helpfulCount: 28,
    replies: [
      {
        id: 'rep-1',
        author: 'Rohan M.',
        time: '1 hour ago',
        message: 'Congrats Priya! How in-depth did they go into distributed consensus and split-brain recovery in round 3?'
      },
      {
        id: 'rep-2',
        author: 'Priya S.',
        time: '35 mins ago',
        message: 'They specifically drilled into network partition trade-offs (CP vs AP) and standby leader promotion.'
      }
    ]
  },
  {
    id: 'post-2',
    author: 'Karan V.',
    company: 'Amazon',
    role: 'SDE II',
    time: '5 hours ago',
    type: 'offer',
    title: 'Amazon SDE II Offer — 14 Leadership Principles Framing in Live Screen',
    message: 'TeLos’s pacing tracker got my filler words down from 8% to 1.2%. During the behavioral bar raiser, structuring answers strictly in STAR (Situation, Task, Action, Measurable Result) made a massive difference.',
    upvotes: 35,
    helpfulCount: 19,
    replies: [
      {
        id: 'rep-3',
        author: 'Ananya D.',
        time: '3 hours ago',
        message: 'Which LP did they focus on the most in the bar raiser?'
      }
    ]
  },
  {
    id: 'post-3',
    author: 'Dev Patel',
    company: 'Microsoft',
    role: 'Senior Software Engineer',
    time: '1 day ago',
    type: 'question',
    title: 'Top System Design PYQs for Azure Core Cloud Teams',
    message: 'Practicing the 24 curated company drills on TeLos right now. Highly recommend doing the Distributed Lock and Rate Limiter drills before Azure interviews.',
    upvotes: 29,
    helpfulCount: 15,
    replies: []
  }
];

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', mode: intelligence.mode, llm: intelligence.llm, deepgram: Boolean(process.env.DEEPGRAM_API_KEY) })
);
app.get('/api/analytics', (_req, res) => res.json({ sessions: demoSessions }));
app.get('/api/problems', (_req, res) => res.json({ problems }));
app.get('/api/personas', (_req, res) => res.json({ personas }));
app.get('/api/community', (_req, res) => res.json({ posts: communityPosts }));
app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim(); const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || '');
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return res.status(400).json({ error: 'Use a name, a valid email, and a password with at least 8 characters.' });
    const existing = await userStore.findByEmail(email);
    if (existing) return res.status(409).json({ error: 'An account already exists for this email. Please sign in.' });
    const user = await userStore.create({ name, email, passwordHash: await passwordHash(password), provider: 'email' });
    res.status(201).json({ user: publicUser(user), token: makeToken(user) });
  } catch (error) { next(error); }
});
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || '');
    const user = await userStore.findByEmail(email);
    if (!user || !user.passwordHash || !(await passwordMatches(password, user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    res.json({ user: publicUser(user), token: makeToken(user) });
  } catch (error) { next(error); }
});
app.get('/api/auth/google/url', (req, res) => {
  const redirectUri = String(req.query.redirect_uri || `${req.protocol}://${req.get('host')}/api/auth/google/callback`);
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
  const scope = encodeURIComponent('openid email profile');
  const url = clientId
    ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account`
    : '';
  res.json({ url, configured: Boolean(clientId) });
});

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const code = String(req.query.code || '');
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    let email = '';
    let name = '';

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (code && clientId && clientSecret) {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });
      if (tokenRes.ok) {
        const tokens = await tokenRes.json() as any;
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        if (userinfoRes.ok) {
          const info = await userinfoRes.json() as any;
          email = info.email?.toLowerCase();
          name = info.name || info.given_name || 'Google Candidate';
        }
      }
    }

    if (!email) {
      return res.status(400).send('Google authentication code could not be verified.');
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { name: name || 'Google Candidate', provider: 'google' },
      create: { email, name: name || 'Google Candidate', provider: 'google' }
    });

    const token = makeToken(user);
    const authData = JSON.stringify({ token, user: publicUser(user) });

    res.send(`<!DOCTYPE html>
<html>
<head><title>TeLos Google Auth</title></head>
<body style="font-family:sans-serif;text-align:center;padding:40px;">
  <p>Authenticating with Google...</p>
  <script>
    if (window.opener) {
      window.opener.postMessage({ type: 'TELOS_AUTH_SUCCESS', data: ${authData} }, '*');
      window.close();
    } else {
      localStorage.setItem('telos-token', ${JSON.stringify(token)});
      window.location.href = '/';
    }
  </script>
</body>
</html>`);
  } catch (err: any) {
    res.status(500).send(`Google auth error: ${err.message}`);
  }
});

app.post('/api/auth/google', async (req, res, next) => {
  try {
    const credential = String(req.body.credential || '');
    let email = String(req.body.email || '').trim().toLowerCase();
    let name = String(req.body.name || '').trim();

    if (credential) {
      try {
        const google = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (google.ok) {
          const profile = await google.json() as { aud?: string; email?: string; email_verified?: string; name?: string; given_name?: string };
          if (profile.email && (profile.email_verified === 'true' || profile.email_verified === (true as any))) {
            email = profile.email.toLowerCase();
            name = profile.name || profile.given_name || name || 'Google Candidate';
          }
        }
      } catch {
        // Fall back to direct profile payload if token info lookup fails
      }
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required for Google authentication.' });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: { name: name || 'Google Candidate', provider: 'google' },
      create: { email, name: name || 'Google Candidate', provider: 'google' }
    });
    res.json({ user: publicUser(user), token: makeToken(user) });
  } catch (error) { next(error); }
});

app.get('/api/auth/linkedin/url', (req, res) => {
  const redirectUri = String(req.query.redirect_uri || `${req.protocol}://${req.get('host')}/api/auth/linkedin/callback`);
  const clientId = process.env.LINKEDIN_CLIENT_ID || process.env.VITE_LINKEDIN_CLIENT_ID || '';
  const scope = encodeURIComponent('openid profile email');
  const state = randomBytes(16).toString('hex');
  const url = clientId
    ? `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`
    : '';
  res.json({ url, configured: Boolean(clientId) });
});

app.get('/api/auth/linkedin/callback', async (req, res) => {
  try {
    const code = String(req.query.code || '');
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/linkedin/callback`;
    let email = '';
    let name = '';
    let linkedinUrl = '';

    const clientId = process.env.LINKEDIN_CLIENT_ID || process.env.VITE_LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (code && clientId && clientSecret) {
      const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });
      if (tokenRes.ok) {
        const tokens = await tokenRes.json() as any;
        const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        if (userinfoRes.ok) {
          const info = await userinfoRes.json() as any;
          email = info.email?.toLowerCase();
          name = info.name || `${info.given_name || ''} ${info.family_name || ''}`.trim() || 'LinkedIn Candidate';
          linkedinUrl = info.sub ? `https://linkedin.com/in/${info.sub}` : '';
        }
      }
    }

    if (!email) {
      return res.status(400).send('LinkedIn authorization code could not be verified.');
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || 'LinkedIn Candidate',
        provider: 'linkedin',
        ...(linkedinUrl ? { linkedin: linkedinUrl } : {})
      },
      create: {
        email,
        name: name || 'LinkedIn Candidate',
        provider: 'linkedin',
        linkedin: linkedinUrl || 'https://linkedin.com/in/'
      }
    });

    const token = makeToken(user);
    const authData = JSON.stringify({ token, user: publicUser(user) });

    res.send(`<!DOCTYPE html>
<html>
<head><title>TeLos LinkedIn Auth</title></head>
<body style="font-family:sans-serif;text-align:center;padding:40px;">
  <p>Authenticating with LinkedIn...</p>
  <script>
    if (window.opener) {
      window.opener.postMessage({ type: 'TELOS_AUTH_SUCCESS', data: ${authData} }, '*');
      window.close();
    } else {
      localStorage.setItem('telos-token', ${JSON.stringify(token)});
      window.location.href = '/';
    }
  </script>
</body>
</html>`);
  } catch (err: any) {
    res.status(500).send(`LinkedIn auth error: ${err.message}`);
  }
});

app.post('/api/auth/linkedin', async (req, res, next) => {
  try {
    let email = String(req.body.email || '').trim().toLowerCase();
    let name = String(req.body.name || '').trim();
    const linkedinUrl = String(req.body.linkedinUrl || '').trim();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'A valid email is required for LinkedIn authentication.' });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name || 'LinkedIn Candidate',
        provider: 'linkedin',
        ...(linkedinUrl ? { linkedin: linkedinUrl } : {})
      },
      create: {
        email,
        name: name || 'LinkedIn Candidate',
        provider: 'linkedin',
        linkedin: linkedinUrl || 'https://linkedin.com/in/'
      }
    });
    res.json({ user: publicUser(user), token: makeToken(user) });
  } catch (error) { next(error); }
});
app.get('/api/auth/me', async (req, res, next) => {
  try {
    const user = await authenticatedUser(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});
app.patch('/api/auth/me', async (req, res, next) => {
  try {
    const user = await authenticatedUser(req.headers.authorization);
    if (!user) return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    const clean = (value: unknown, max: number) => String(value || '').trim().slice(0, max);
    const updated = await userStore.update(user.id, {
      name: clean(req.body.name, 80) || user.name,
      bio: clean(req.body.bio, 600),
      linkedin: clean(req.body.linkedin, 240),
      github: clean(req.body.github, 240),
      experience: clean(req.body.experience, 2400),
      projects: clean(req.body.projects, 4000)
    });
    res.json({ user: publicUser(updated || user) });
  } catch (error) { next(error); }
});
app.post('/api/community', async (req, res, next) => {
  try {
    const newPost = req.body;
    if (newPost && newPost.id && newPost.message) {
      communityPosts.unshift(newPost);
      if (communityPosts.length > 100) communityPosts.pop();
    }
    res.json({ posts: communityPosts });
  } catch (error) {
    next(error);
  }
});
app.post('/api/community/reply', async (req, res, next) => {
  try {
    const { postId, reply } = req.body;
    if (postId && reply && reply.message) {
      const target = communityPosts.find(p => p.id === postId);
      if (target) {
        if (!target.replies) target.replies = [];
        target.replies.push(reply);
      }
    }
    res.json({ posts: communityPosts });
  } catch (error) {
    next(error);
  }
});
app.post('/api/community/vote', async (req, res, next) => {
  try {
    const { postId, delta } = req.body;
    if (postId) {
      const target = communityPosts.find(p => p.id === postId);
      if (target) {
        target.upvotes = Math.max(0, (target.upvotes || 0) + (Number(delta) || 1));
      }
    }
    res.json({ posts: communityPosts });
  } catch (error) {
    next(error);
  }
});
app.post('/api/classify', async (req, res, next) => {
  try { res.json(await intelligence.classify(String(req.body.text || ''))); } catch (error) { next(error); }
});
app.post('/api/interviewer/next', async (req, res, next) => {
  try { res.json(await intelligence.nextQuestion(req.body)); } catch (error) { next(error); }
});
app.post('/api/interviewer/next/stream', async (req, res, next) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    await intelligence.streamQuestion(req.body, (chunk: string) => {
      res.write(`event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
    });
    res.write('event: done\ndata: {}\n\n');
    res.end();
  } catch (error) { next(error); }
});
app.post('/api/run', async (req, res, next) => {
  try {
    const result = await runCodeSnippet(String(req.body.code || ''), String(req.body.language || 'js'), String(req.body.problemId || ''));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.post('/api/tts', async (req, res, next) => {
  try {
    let text = String(req.body.text || '').trim();
    if (!text) {
      return res.status(400).send('Text is required');
    }

    // Natural Pacing: Clean formatting for realistic conversational cadence
    // Insert natural breathing pauses for short acknowledgments
    text = text
      .replace(/^(okay|got it|makes sense|alright|cool|right),?\s+/i, '$1... ')
      .replace(/(\w)—(\w)/g, '$1 — $2');

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY || (req.headers['x-elevenlabs-key'] as string);
    // ElevenLabs "Adam" (pNInz6obpgDQGcFmaJgB) - Natural Conversational Male Preset
    const elevenLabsVoiceId = String(req.body.voiceId || process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB');

    // 1. ElevenLabs Ultra-Realistic Conversational Voice Engine
    if (elevenLabsApiKey) {
      try {
        const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}?output_format=mp3_44100_128`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenLabsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2_5', // Ultra-fast low-latency natural human model
            voice_settings: {
              stability: 0.38, // 0.35-0.50: Prevents robotic monotone and preserves natural pitch variation
              similarity_boost: 0.80, // 0.75-0.85: Keeps natural tone consistent
              style: 0.28, // 0.20-0.40: Adds natural conversational inflection and warmth
              use_speaker_boost: true, // Enhances clarity without artifacts
            },
          }),
        });

        if (elevenRes.ok) {
          const buffer = Buffer.from(await elevenRes.arrayBuffer());
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', buffer.length);
          return res.send(buffer);
        } else {
          console.warn('ElevenLabs API error status:', elevenRes.status, await elevenRes.text().catch(() => ''));
        }
      } catch (elevenErr) {
        console.warn('ElevenLabs TTS error:', elevenErr);
      }
    }

    // 2. Deepgram Aura TTS (High-speed natural conversational voice fallback)
    if (process.env.DEEPGRAM_API_KEY) {
      try {
        const deepgramVoice = req.body.voice === 'asteria' ? 'aura-asteria-en' : 'aura-arcas-en';
        const dgRes = await fetch(`https://api.deepgram.com/v1/speak?model=${deepgramVoice}&encoding=mp3`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        if (dgRes.ok) {
          const buffer = Buffer.from(await dgRes.arrayBuffer());
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('Content-Length', buffer.length);
          return res.send(buffer);
        }
      } catch (dgErr) {
        console.warn('Deepgram TTS fallback:', dgErr);
      }
    }

    // 2. Try OpenAI TTS (tts-1)
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('uvwx')) {
      const requestedVoice = String(req.body.voice || 'alloy');
      const voice = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(requestedVoice) ? requestedVoice : 'alloy';

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice,
          input: text,
          speed: 0.98,
          response_format: 'mp3',
        }),
      });

      if (response.ok) {
        const audioBuffer = Buffer.from(await response.arrayBuffer());
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', audioBuffer.length);
        return res.send(audioBuffer);
      }
    }

    res.status(503).json({ error: 'Cloud TTS unavailable, using browser natural neural synthesis.' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/interview/debrief', async (req, res, next) => {
  try {
    const { transcript = [], company, role, resume, focus, speechStats } = req.body;
    const report = await intelligence.generateDebriefReport({
      transcript,
      company,
      role,
      resume,
      focus,
      speechStats
    });
    return res.json(report);
  } catch (error) {
    next(error);
  }
});

app.post('/api/report', async (req, res, next) => {
  try {
    const { transcript = [], company, role, resume, focus, speechStats } = req.body;
    const report = await intelligence.generateDebriefReport({
      transcript,
      company,
      role,
      resume,
      focus,
      speechStats
    });
    return res.json(report);
  } catch (error) {
    next(error);
  }
});

const port = Number(process.env.PORT || 8787);

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

// Universal JSON error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', err);
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({ error: err?.message || 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => console.log(`TeLos API listening on port ${port}`));
