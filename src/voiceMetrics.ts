export function calculateSpeakingPace(words: number, minutes: number): number {
  if (!minutes || minutes <= 0) return words > 0 ? Math.round(words * 60) : 0;
  return Math.round((words / minutes));
}

export function buildSessionReport({ answerCount, pace }: { answerCount: number; pace: number }) {
  const clarity = Math.min(95, 70 + answerCount * 5);
  const accuracy = Math.min(95, 74 + answerCount * 3);
  const paceScore = Math.min(180, 120 + Math.round(pace / 10));
  const rhythmScore = Math.min(95, 72 + Math.round((pace - 120) / 6));
  return { clarity, accuracy, paceScore, rhythmScore };
}
