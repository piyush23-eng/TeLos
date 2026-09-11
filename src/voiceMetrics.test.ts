import { describe, it, expect } from "vitest";
import { calculateSpeakingPace, countFillerWords, buildSessionReport, exportDebriefToMarkdown } from "./voiceMetrics";

describe("voiceMetrics", () => {
  it("calculates speaking pace correctly for standard durations", () => {
    expect(calculateSpeakingPace(300, 2)).toBe(150);
    expect(calculateSpeakingPace(140, 1)).toBe(140);
  });

  it("handles pace calculation edge cases (zero words, zero or negative minutes)", () => {
    expect(calculateSpeakingPace(0, 2)).toBe(0);
    expect(calculateSpeakingPace(100, 0)).toBe(6000);
    expect(calculateSpeakingPace(100, -1)).toBe(6000);
    expect(calculateSpeakingPace(0, 0)).toBe(0);
  });

  it("identifies vocal filler words accurately across multiple occurrences", () => {
    const speech = "Basically, we like used Redis cache and um you know it was actually fast.";
    const result = countFillerWords(speech);
    expect(result.count).toBe(5);
    expect(result.fillers["basically"]).toBe(1);
    expect(result.fillers["like"]).toBe(1);
    expect(result.fillers["um"]).toBe(1);
    expect(result.fillers["you know"]).toBe(1);
    expect(result.fillers["actually"]).toBe(1);
  });

  it("returns zero filler words for clean, articulate technical responses", () => {
    const speech = "We implemented Raft consensus with leader election and quorum-based log replication.";
    const result = countFillerWords(speech);
    expect(result.count).toBe(0);
    expect(Object.keys(result.fillers).length).toBe(0);
  });

  it("computes session telemetry reports within bounded limits", () => {
    const report = buildSessionReport({ answerCount: 3, pace: 145 });
    expect(report.clarity).toBeGreaterThanOrEqual(70);
    expect(report.clarity).toBeLessThanOrEqual(95);
    expect(report.accuracy).toBeGreaterThanOrEqual(74);
    expect(report.accuracy).toBeLessThanOrEqual(95);
    expect(report.paceScore).toBeGreaterThanOrEqual(120);
    expect(report.rhythmScore).toBeGreaterThanOrEqual(72);
  });

  it("exports comprehensive markdown debrief report with structured scores", () => {
    const mockDebrief = {
      hiringRecommendation: "Strong Hire",
      hiringRationale: "Exceptional mastery of distributed consensus and cache consistency.",
      scores: {
        overall: 88,
        technicalDepth: 85,
        problemSolving: 90,
        communication: 88
      }
    };
    const md = exportDebriefToMarkdown(mockDebrief, { company: "Google", role: "Staff Engineer", focus: "Distributed Systems" });
    expect(md).toContain("# TeLos Technical Interview Debrief & Scorecard");
    expect(md).toContain("Strong Hire");
    expect(md).toContain("Google");
    expect(md).toContain("88/100");
    expect(md).toContain("Distributed Systems");
  });

  it("includes question-by-question comparative breakdown in markdown debrief", () => {
    const mockDebrief = {
      hiringRecommendation: "Hire",
      scores: { overall: 82 },
      questionsAnalysis: [
        {
          question: "How do you handle split-brain in Raft?",
          verdict: "Exceptional",
          whatYouSaid: "I would ensure quorums require majority votes.",
          whatYouShouldSay: "Enforce strict (N/2 + 1) quorums and term epoch validation to reject stale leaders.",
          feedback: "Strong intuition; explicitly mention term epochs next time."
        }
      ]
    };
    const md = exportDebriefToMarkdown(mockDebrief, { company: "Amazon", role: "SDE II" });
    expect(md).toContain("How do you handle split-brain in Raft?");
    expect(md).toContain("What You Said");
    expect(md).toContain("Ideal High-Bar Response");
    expect(md).toContain("Concrete Feedback");
  });

  it("handles empty or null debrief inputs gracefully without throwing", () => {
    expect(exportDebriefToMarkdown(null, {})).toBe("");
    expect(exportDebriefToMarkdown(undefined, {})).toBe("");
    const emptyMd = exportDebriefToMarkdown({}, {});
    expect(emptyMd).toContain("# TeLos Technical Interview Debrief & Scorecard");
    expect(emptyMd).toContain("Tech Company");
  });
});

