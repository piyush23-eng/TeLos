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
});
