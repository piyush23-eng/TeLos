import assert from 'node:assert/strict';
import { buildHeuristicQuestion } from './intelligence';

const followup = buildHeuristicQuestion({
  role: 'Backend Engineer',
  focus: 'systems design',
  transcript: [
    { speaker: 'interviewer', text: 'Tell me about a recent system you built.' },
    { speaker: 'candidate', text: 'I used Kafka with Redis caching, but the retry path caused duplicate writes under retries and we saw a 20% spike in latency.' }
  ],
  phase: 'followup'
});

assert.match(followup.question, /failure|contain|production|retry|latency|load/i);
console.log('heuristic follow-up OK:', followup.question);
