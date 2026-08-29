import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaClient } from '@prisma/client';
import { demoSessions, personas, problems } from './mockData';
import { IntelligenceProvider } from './intelligence';
import { runCodeSnippet } from './runner';

const app = express();
app.use(cors()); app.use(express.json());
const intelligence = new IntelligenceProvider();
const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);
const sessionSecret = process.env.AUTH_SESSION_SECRET || 'telos-development-secret-change-me';
const makeToken = (user: { id: string; email: string }) => {
  const payload = Buffer.from(JSON.stringify({ sub: user.id, email: user.email, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};
const publicUser = (user: { id: string; name: string; email: string; provider: string; bio: string; linkedin: string; github: string; experience: string; projects: string }) => ({ id: user.id, name: user.name, email: user.email, provider: user.provider, bio: user.bio, linkedin: user.linkedin, github: user.github, experience: user.experience, projects: user.projects });
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
    return await prisma.user.findUnique({ where: { id: claims.sub } });
  } catch { return null; }
};

const communityPosts = [
  { id: 'post-1', author: 'Aria', role: 'SWE Candidate', message: 'Just finished a Google loop. They asked a systems design question about caching invalidation and wanted latency vs correctness trade-offs.', tags: ['google', 'design', 'signal'], timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: 'post-2', author: 'Dev', role: 'Backend Intern', message: 'Shared my response to the behavioral question: I focused on impact, metrics, and owning failure recovery. Recruiter said it landed well.', tags: ['behavioral', 'feedback'], timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString() }
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
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'An account already exists for this email. Please sign in.' });
    const user = await prisma.user.create({ data: { name, email, passwordHash: await passwordHash(password), provider: 'email' } });
    res.status(201).json({ user: publicUser(user), token: makeToken(user) });
  } catch (error) { next(error); }
});
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase(); const password = String(req.body.password || '');
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash || !(await passwordMatches(password, user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect.' });
    res.json({ user: publicUser(user), token: makeToken(user) });
  } catch (error) { next(error); }
});
app.post('/api/auth/google', async (req, res, next) => {
  try {
    const credential = String(req.body.credential || '');
    if (!credential || !process.env.GOOGLE_CLIENT_ID) return res.status(400).json({ error: 'Google sign-in is not configured on this environment.' });
    const google = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
    if (!google.ok) return res.status(401).json({ error: 'Google could not verify this sign-in.' });
    const profile = await google.json() as { aud?: string; email?: string; email_verified?: string; name?: string; given_name?: string };
    if (profile.aud !== process.env.GOOGLE_CLIENT_ID || !profile.email || profile.email_verified !== 'true') return res.status(401).json({ error: 'This Google account could not be verified.' });
    const user = await prisma.user.upsert({ where: { email: profile.email.toLowerCase() }, update: { name: profile.name || profile.given_name || 'TeLos candidate', provider: 'google' }, create: { email: profile.email.toLowerCase(), name: profile.name || profile.given_name || 'TeLos candidate', provider: 'google' } });
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
    const updated = await prisma.user.update({ where: { id: user.id }, data: {
      name: clean(req.body.name, 80) || user.name,
      bio: clean(req.body.bio, 600),
      linkedin: clean(req.body.linkedin, 240),
      github: clean(req.body.github, 240),
      experience: clean(req.body.experience, 2400),
      projects: clean(req.body.projects, 4000)
    } });
    res.json({ user: publicUser(updated) });
  } catch (error) { next(error); }
});
app.post('/api/community', async (req, res, next) => {
  try {
    const newPost = req.body;
    if (newPost && newPost.id && newPost.message) {
      communityPosts.unshift(newPost);
      if (communityPosts.length > 50) communityPosts.pop();
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
app.listen(port, () => console.log(`TeLos API listening on http://localhost:${port}`));
