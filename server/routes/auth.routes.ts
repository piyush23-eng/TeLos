import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { prisma } from '../lib/prisma';
import { config } from '../lib/config';
import { authRateLimiter } from '../middleware/rateLimiter';
import {
  userStore,
  passwordHash,
  passwordMatches,
  makeToken,
  publicUser,
  authenticatedUser
} from '../middleware/auth';

export const authRouter = Router();

// Email / Password Signup
authRouter.post('/signup', authRateLimiter, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      return res.status(400).json({ error: 'Use a name, a valid email, and a password with at least 8 characters.' });
    }

    const existing = await userStore.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account already exists for this email. Please sign in.' });
    }

    const user = await userStore.create({
      name,
      email,
      passwordHash: await passwordHash(password),
      provider: 'email'
    });

    res.status(201).json({ user: publicUser(user), token: makeToken(user) });
  } catch (error) {
    next(error);
  }
});

// Email / Password Login
authRouter.post('/login', authRateLimiter, async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const user = await userStore.findByEmail(email);
    if (!user || !user.passwordHash || !(await passwordMatches(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    res.json({ user: publicUser(user), token: makeToken(user) });
  } catch (error) {
    next(error);
  }
});

// Google OAuth URL
authRouter.get('/google/url', (req, res) => {
  const redirectUri = String(req.query.redirect_uri || `${req.protocol}://${req.get('host')}/api/auth/google/callback`);
  const clientId = config.googleClientId;
  const scope = encodeURIComponent('openid email profile');
  const url = clientId
    ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=select_account`
    : '';
  res.json({ url, configured: Boolean(clientId) });
});

// Google OAuth Callback
authRouter.get('/google/callback', async (req, res) => {
  try {
    const code = String(req.query.code || '');
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    let email = '';
    let name = '';

    const clientId = config.googleClientId;
    const clientSecret = config.googleClientSecret;

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
        const tokens = (await tokenRes.json()) as any;
        const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        if (userinfoRes.ok) {
          const info = (await userinfoRes.json()) as any;
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
    const authData = JSON.stringify({ token, user: publicUser(user as any) });

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

// Google Direct Credential Verification
authRouter.post('/google', async (req, res, next) => {
  try {
    const credential = String(req.body.credential || '');
    let email = String(req.body.email || '').trim().toLowerCase();
    let name = String(req.body.name || '').trim();

    if (credential) {
      try {
        const google = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (google.ok) {
          const profile = (await google.json()) as {
            aud?: string;
            email?: string;
            email_verified?: string;
            name?: string;
            given_name?: string;
          };
          if (profile.email && (profile.email_verified === 'true' || profile.email_verified === (true as any))) {
            email = profile.email.toLowerCase();
            name = profile.name || profile.given_name || name || 'Google Candidate';
          }
        }
      } catch {
        // Fall back to direct profile payload
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
    res.json({ user: publicUser(user as any), token: makeToken(user) });
  } catch (error) {
    next(error);
  }
});

// LinkedIn OAuth URL
authRouter.get('/linkedin/url', (req, res) => {
  const redirectUri = String(req.query.redirect_uri || `${req.protocol}://${req.get('host')}/api/auth/linkedin/callback`);
  const clientId = config.linkedinClientId;
  const scope = encodeURIComponent('openid profile email');
  const state = randomBytes(16).toString('hex');
  const url = clientId
    ? `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`
    : '';
  res.json({ url, configured: Boolean(clientId) });
});

// LinkedIn OAuth Callback
authRouter.get('/linkedin/callback', async (req, res) => {
  try {
    const code = String(req.query.code || '');
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/linkedin/callback`;
    let email = '';
    let name = '';
    let linkedinUrl = '';

    const clientId = config.linkedinClientId;
    const clientSecret = config.linkedinClientSecret;

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
        const tokens = (await tokenRes.json()) as any;
        const userinfoRes = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        if (userinfoRes.ok) {
          const info = (await userinfoRes.json()) as any;
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
    const authData = JSON.stringify({ token, user: publicUser(user as any) });

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

// LinkedIn Direct Profile Sign-in
authRouter.post('/linkedin', async (req, res, next) => {
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
    res.json({ user: publicUser(user as any), token: makeToken(user) });
  } catch (error) {
    next(error);
  }
});

// Current User Profile
authRouter.get('/me', async (req, res, next) => {
  try {
    const user = await authenticatedUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

// Update Profile
authRouter.patch('/me', async (req, res, next) => {
  try {
    const user = await authenticatedUser(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
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
  } catch (error) {
    next(error);
  }
});
