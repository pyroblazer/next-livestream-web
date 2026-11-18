import { describe, expect, it } from "vitest";
import {
  clampSlowMode,
  clampTimeoutMinutes,
  containsBannedWord,
  isTimeoutActive,
  normalizeCategory,
  parseBannedWords,
  parseReportReason,
  slowModeWait,
} from "@/lib/moderation";

describe("moderation rules", () => {
  it("parses banned words: trims, lowercases, dedupes, drops junk", () => {
    expect(parseBannedWords("Spam, SPAM\n  scam ,x, ")).toEqual(["spam", "scam"]);
    expect(parseBannedWords(null)).toEqual([]);
  });

  it("matches banned words case-insensitively", () => {
    expect(containsBannedWord("Buy my SCAM now", ["scam"])).toBe(true);
    expect(containsBannedWord("hello", ["scam"])).toBe(false);
    expect(containsBannedWord("anything", [])).toBe(false);
  });

  it("computes slow-mode wait", () => {
    expect(slowModeWait(null, 1000, 10)).toBe(0);
    expect(slowModeWait(1000, 4000, 10)).toBe(7);
    expect(slowModeWait(1000, 20000, 10)).toBe(0);
    expect(slowModeWait(1000, 1500, 0)).toBe(0);
  });

  it("clamps numeric inputs", () => {
    expect(clampSlowMode(-5)).toBe(0);
    expect(clampSlowMode("abc")).toBe(0);
    expect(clampSlowMode(9999)).toBe(120);
    expect(clampTimeoutMinutes(0)).toBe(1);
    expect(clampTimeoutMinutes(999999)).toBe(10080);
  });

  it("detects active timeouts", () => {
    const now = Date.parse("2025-01-01T00:00:00Z");
    expect(isTimeoutActive("2025-01-01T00:05:00Z", now)).toBe(true);
    expect(isTimeoutActive("2024-12-31T23:59:00Z", now)).toBe(false);
    expect(isTimeoutActive(null, now)).toBe(false);
  });

  it("whitelists categories and report reasons", () => {
    expect(normalizeCategory("gaming")).toBe("Gaming");
    expect(normalizeCategory("<script>")).toBeNull();
    expect(parseReportReason("spam")).toBe("spam");
    expect(parseReportReason("whatever")).toBeNull();
  });
});
