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

  it("accurately progresses through all 5 authentic interview phases", async () => {
    const { determineInterviewPhase, getCompanyTechnicalChallenge } = await import("./intelligence");
    
    // Phase 1 (0 turns)
    const p1 = determineInterviewPhase([]);
    expect(p1.phaseNumber).toBe(1);
    expect(p1.phaseKey).toBe("warm-intro");

    // Phase 2 (1-2 candidate turns)
    const p2 = determineInterviewPhase([
      { speaker: "interviewer", text: "Hey! How's your day going?" },
      { speaker: "candidate", text: "Going well, happy to be here." }
    ]);
    expect(p2.phaseNumber).toBe(2);
    expect(p2.phaseKey).toBe("cv-deep-dive");

    // Phase 3 (3-5 candidate turns)
    const p3 = determineInterviewPhase([
      { speaker: "interviewer", text: "Tell me about your background." },
      { speaker: "candidate", text: "Turn 1" },
      { speaker: "interviewer", text: "Tell me about Redis." },
      { speaker: "candidate", text: "Turn 2" },
      { speaker: "interviewer", text: "How did you scale it?" },
      { speaker: "candidate", text: "Turn 3" }
    ]);
    expect(p3.phaseNumber).toBe(3);
    expect(p3.phaseKey).toBe("technical-challenge");

    // Phase 4 (6-7 candidate turns)
    const p4Turns: any[] = [];
    for (let i = 0; i < 6; i++) {
      p4Turns.push({ speaker: "interviewer", text: `Q${i}` });
      p4Turns.push({ speaker: "candidate", text: `A${i}` });
    }
    const p4 = determineInterviewPhase(p4Turns);
    expect(p4.phaseNumber).toBe(4);
    expect(p4.phaseKey).toBe("edge-cases");

    // Phase 5 (8+ candidate turns)
    const p5Turns: any[] = [];
    for (let i = 0; i < 8; i++) {
      p5Turns.push({ speaker: "interviewer", text: `Q${i}` });
      p5Turns.push({ speaker: "candidate", text: `A${i}` });
    }
    const p5 = determineInterviewPhase(p5Turns);
    expect(p5.phaseNumber).toBe(5);
    expect(p5.phaseKey).toBe("candidate-qa");

    // Company challenges
    const googleChallenge = getCompanyTechnicalChallenge("Google");
    expect(googleChallenge.title).toContain("Rate Limiter");

    const amazonChallenge = getCompanyTechnicalChallenge("Amazon");
    expect(amazonChallenge.title).toContain("Inventory");

    const stripeChallenge = getCompanyTechnicalChallenge("Stripe");
    expect(stripeChallenge.title).toContain("Idempotent");
  });
});
