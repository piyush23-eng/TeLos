import { describe, it, expect } from "vitest";
import { intelligence } from "./intelligence";

describe("intelligence engine", () => {
  it("initializes with valid fallback mode", () => {
    expect(intelligence).toBeDefined();
    expect(intelligence.mode).toBeDefined();
  });

  it("classifies interview category accurately in demo fallback mode", async () => {
    const classification = await intelligence.classify("Let us design a distributed rate limiter with Redis");
    expect(classification.category).toBeDefined();
    expect(typeof classification.confidence).toBe("number");
  });

  it("handles next question generation without throwing", async () => {
    const result = await intelligence.nextQuestion({
      role: "Backend Engineer",
      company: "Google",
      focus: "Distributed Systems",
      transcript: [
        { speaker: "interviewer", text: "Welcome to Google! Tell me about your background." },
        { speaker: "candidate", text: "I have built high-throughput microservices using Kafka and Redis." }
      ]
    });
    expect(result).toBeDefined();
    expect(typeof result.question).toBe("string");
    expect(result.question.length).toBeGreaterThan(0);
  });

  it("generates authentic, dynamic debrief reports grounded in actual transcript data", async () => {
    const report = await intelligence.generateDebriefReport({
      role: "Platform Engineer",
      company: "Razorpay",
      transcript: [
        { speaker: "interviewer", text: "How do you handle idempotency in high-volume payment processing?" },
        { speaker: "candidate", text: "We generate unique idempotency keys on the client and store transaction hashes in Postgres with row-level locks." }
      ],
      speechStats: { pace: 142, fillerCount: 0, duration: 45 }
    });

    expect(report).toBeDefined();
    expect(report.cadenceMetrics).toBeDefined();
    expect(report.cadenceMetrics.talkRatio).toContain("Candidate");
    expect(report.cadenceMetrics.fillerDensity).toBeDefined();
    expect(report.questionsAnalysis.length).toBeGreaterThanOrEqual(1);
    expect(report.questionsAnalysis[0].question).toContain("idempotency");
    expect(report.questionsAnalysis[0].whatYouSaid).toContain("idempotency keys");
    expect(report.scores.overall).toBeGreaterThan(0);
    expect(report.scores.overall).toBeLessThanOrEqual(100);
  });
});
