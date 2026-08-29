import { describe, it, expect } from "vitest";
import { calculateSpeakingPace, countFillerWords, buildSessionReport, exportDebriefToMarkdown } from "./voiceMetrics";

describe("voiceMetrics", () => {
  it("calculates speaking pace correctly", () => {
    expect(calculateSpeakingPace(300, 2)).toBe(150);
    expect(calculateSpeakingPace(0, 2)).toBe(0);
    expect(calculateSpeakingPace(100, 0)).toBe(6000);
  });

  it("identifies vocal filler words accurately", () => {
    const speech = "Basically, we like used Redis cache and um you know it was actually fast.";
    const result = countFillerWords(speech);
    expect(result.count).toBe(5);
    expect(result.fillers["basically"]).toBe(1);
    expect(result.fillers["like"]).toBe(1);
    expect(result.fillers["um"]).toBe(1);
    expect(result.fillers["you know"]).toBe(1);
    expect(result.fillers["actually"]).toBe(1);
  });

  it("computes session telemetry reports within bounded limits", () => {
    const report = buildSessionReport({ answerCount: 3, pace: 145 });
    expect(report.clarity).toBeGreaterThanOrEqual(70);
    expect(report.clarity).toBeLessThanOrEqual(95);
    expect(report.accuracy).toBeGreaterThanOrEqual(74);
    expect(report.accuracy).toBeLessThanOrEqual(95);
  });

  it("exports comprehensive markdown debrief report", () => {
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
    const md = exportDebriefToMarkdown(mockDebrief, { company: "Google", role: "Staff Engineer" });
    expect(md).toContain("# TeLos Technical Interview Debrief & Scorecard");
    expect(md).toContain("Strong Hire");
    expect(md).toContain("Google");
    expect(md).toContain("88/100");
  });
});
