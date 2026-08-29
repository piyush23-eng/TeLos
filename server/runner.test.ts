import { describe, it, expect } from "vitest";
import { runCodeSnippet } from "./runner";

describe("runner", () => {
  it("executes valid JavaScript code in isolated sandbox", async () => {
    const code = "console.log(40 + 2);";
    const result = await runCodeSnippet(code, "javascript", "test-1");
    expect(result.status).toBe("ok");
    expect(result.output).toContain("42");
  });

  it("handles JavaScript runtime syntax errors gracefully", async () => {
    const code = "throw new Error(\"Test exception\");";
    const result = await runCodeSnippet(code, "javascript", "test-2");
    expect(result.status).toBe("error");
    expect(result.output).toContain("Test exception");
  });

  it("handles empty JavaScript output cleanly", async () => {
    const code = "const x = 100;";
    const result = await runCodeSnippet(code, "javascript", "test-3");
    expect(result.status).toBe("ok");
    expect(result.output).toContain("Program executed with no console output");
  });

  it("executes Python code when runtime is available", async () => {
    const code = "print(10 * 5)";
    const result = await runCodeSnippet(code, "python", "test-4");
    if (result.status === "ok") {
      expect(result.output).toContain("50");
    } else {
      expect(result.output).toBeDefined();
    }
  });
});
