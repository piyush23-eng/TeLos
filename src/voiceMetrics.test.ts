import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSessionReport, calculateSpeakingPace } from './voiceMetrics';

test('calculateSpeakingPace returns words per minute', () => {
  assert.equal(calculateSpeakingPace(60, 60), 60);
  assert.equal(calculateSpeakingPace(30, 60), 30);
});

test('buildSessionReport uses pace to derive a rhythm score', () => {
  const report = buildSessionReport({ answerCount: 2, pace: 140 });
  assert.ok(report.paceScore >= 120);
  assert.ok(report.rhythmScore >= 70);
});
