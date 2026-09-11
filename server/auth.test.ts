import { describe, it, expect } from 'vitest';
import { passwordHash, passwordMatches, makeToken, userStore } from './middleware/auth';

describe('auth middleware & security', () => {
  it('hashes passwords with unique salts and verifies correct passwords', async () => {
    const password = 'SuperSecurePassword123!';
    const hash1 = await passwordHash(password);
    const hash2 = await passwordHash(password);

    // Salting ensures hashes are different
    expect(hash1).not.toBe(hash2);
    expect(hash1).toContain(':');

    const matches1 = await passwordMatches(password, hash1);
    const matches2 = await passwordMatches(password, hash2);
    const fails = await passwordMatches('WrongPassword!', hash1);

    expect(matches1).toBe(true);
    expect(matches2).toBe(true);
    expect(fails).toBe(false);
  });

  it('generates valid HMAC signed tokens with base64url encoding', () => {
    const user = { id: 'usr-test-123', email: 'test@example.com' };
    const token = makeToken(user);

    expect(token).toBeDefined();
    const parts = token.split('.');
    expect(parts.length).toBe(2);

    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    expect(payload.sub).toBe('usr-test-123');
    expect(payload.email).toBe('test@example.com');
    expect(payload.exp).toBeGreaterThan(Date.now());
  });

  it('creates and finds users in resilient userStore', async () => {
    const email = `test-${Date.now()}@telos.ai`;
    const user = await userStore.create({
      name: 'Refactor Candidate',
      email,
      provider: 'email'
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe(email);

    const foundByEmail = await userStore.findByEmail(email);
    expect(foundByEmail?.id).toBe(user.id);

    const foundById = await userStore.findById(user.id);
    expect(foundById?.email).toBe(email);
  });
});
