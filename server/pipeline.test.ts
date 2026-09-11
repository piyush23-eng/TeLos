import { describe, it, expect } from 'vitest';
import { userStore, passwordHash, passwordMatches, makeToken, authenticatedUser } from './middleware/auth';
import { runCodeSnippet } from './runner';
import { intelligence } from './intelligence';
import { problems, personas, demoSessions } from './mockData';
import { communityPosts } from './routes/community.routes';

describe('Comprehensive Pipeline Verification', () => {
  it('Pipeline: Auth System & User Persistence', async () => {
    const email = `pipeline_${Date.now()}@telos.io`;
    const password = 'StrongPassword123!';
    const name = 'Pipeline Candidate';

    // 1. Password hashing & verification
    const hash = await passwordHash(password);
    expect(await passwordMatches(password, hash)).toBe(true);
    expect(await passwordMatches('WrongPassword', hash)).toBe(false);

    // 2. User creation in store
    const user = await userStore.create({
      name,
      email,
      passwordHash: hash,
      provider: 'email'
    });
    expect(user.id).toBeDefined();
    expect(user.email).toBe(email);

    // 3. User retrieval by email
    const fetched = await userStore.findByEmail(email);
    expect(fetched?.id).toBe(user.id);
    expect(fetched?.name).toBe(name);

    // 4. Token creation & verification
    const token = makeToken(user);
    const authSession = await authenticatedUser(`Bearer ${token}`);
    expect(authSession).not.toBeNull();
    expect(authSession?.id).toBe(user.id);
    expect(authSession?.email).toBe(email);
  });

  it('Pipeline: Polyglot Code Execution Runner', async () => {
    // 1. Python execution
    const pyRes = await runCodeSnippet('print(sum([1, 2, 3, 4]))', 'python');
    expect(pyRes.status).toBe('ok');
    expect(pyRes.output.trim()).toBe('10');

    // 2. JavaScript execution
    const jsRes = await runCodeSnippet('console.log([1, 2, 3].map(x => x * 2).join(","));', 'js');
    expect(jsRes.status).toBe('ok');
    expect(jsRes.output.trim()).toBe('2,4,6');

    // 3. Problem catalog integrity
    expect(Array.isArray(problems)).toBe(true);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0].id).toBeDefined();
    expect(problems[0].title).toBeDefined();
  });

  it('Pipeline: Interview AI Pipeline & Dynamic Turn Generation', async () => {
    // 1. Verify personas catalog
    expect(Array.isArray(personas)).toBe(true);
    expect(personas.length).toBeGreaterThan(0);
    expect(personas[0].name).toBeDefined();

    // 2. Next question progression (tests fallback heuristic when offline)
    const turnResult = await intelligence.nextQuestion({
      role: 'Distributed Systems Engineer',
      company: 'Google',
      round: 'System Design',
      difficulty: 'Senior',
      transcript: [
        { speaker: 'interviewer', text: 'How do you handle data partitioning across multiple shards?' },
        { speaker: 'candidate', text: 'I use consistent hashing with virtual nodes to avoid hotspotting.' }
      ]
    });

    expect(turnResult.question).toBeDefined();
    expect(typeof turnResult.question).toBe('string');
    expect(turnResult.question.length).toBeGreaterThan(10);
  });

  it('Pipeline: Community Discussion & Analytics Data Feeds', () => {
    // 1. Community feed integrity
    expect(Array.isArray(communityPosts)).toBe(true);
    expect(communityPosts.length).toBeGreaterThan(0);
    expect(communityPosts[0].author).toBeDefined();
    expect(communityPosts[0].message).toBeDefined();

    // 2. Analytics receipts integrity
    expect(Array.isArray(demoSessions)).toBe(true);
    expect(demoSessions.length).toBeGreaterThan(0);
    expect(demoSessions[0].star).toBeDefined();
    expect(demoSessions[0].accuracy).toBeDefined();
    expect(demoSessions[0].fillers).toBeDefined();
  });
});
