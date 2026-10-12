import { describe, expect, it } from "vitest";
import { computeMetrics } from "./metrics";
import { mapRun } from "./github";
import { parseRepo } from "./validate";
import { formatDuration, formatMinutes } from "./format";
import type { WorkflowRun } from "./types";

const run = (over: Partial<WorkflowRun>): WorkflowRun => ({
  id: 1, name: "CI", status: "completed", conclusion: "success", branch: "main",
  event: "push", actor: "dev", url: "https://example.com", createdAt: "2026-01-01T00:00:00Z",
  durationSec: 60, ...over,
});

describe("computeMetrics", () => {
  it("returns zeros for no runs", () => {
    const m = computeMetrics([]);
    expect(m.successRate).toBe(0);
    expect(m.mttrMinutes).toBeNull();
  });

  it("computes success rate and durations", () => {
    const m = computeMetrics([
      run({ id: 1, durationSec: 100 }),
      run({ id: 2, durationSec: 200 }),
      run({ id: 3, conclusion: "failure", durationSec: 300 }),
      run({ id: 4, status: "in_progress", conclusion: null }),
    ]);
    expect(m.completedRuns).toBe(3);
    expect(m.failedRuns).toBe(1);
    expect(m.successRate).toBe(66.7);
    expect(m.avgDurationSec).toBe(200);
    expect(m.p95DurationSec).toBe(300);
  });

  it("computes MTTR from failure to next success of the same workflow", () => {
    const m = computeMetrics([
      run({ id: 1, conclusion: "failure", createdAt: "2026-01-01T10:00:00Z" }),
      run({ id: 2, conclusion: "failure", createdAt: "2026-01-01T10:30:00Z" }),
      run({ id: 3, conclusion: "success", createdAt: "2026-01-01T11:00:00Z" }),
    ]);
    expect(m.mttrMinutes).toBe(60);
  });

  it("tracks workflows independently", () => {
    const m = computeMetrics([
      run({ id: 1, name: "CI", conclusion: "failure", createdAt: "2026-01-01T10:00:00Z" }),
      run({ id: 2, name: "Deploy", conclusion: "success", createdAt: "2026-01-01T10:10:00Z" }),
    ]);
    expect(m.mttrMinutes).toBeNull();
  });
});

describe("mapRun", () => {
  it("calculates duration only for completed runs", () => {
    const base = {
      id: 1, name: null, conclusion: "success", head_branch: null, event: "push",
      html_url: "u", created_at: "2026-01-01T00:00:00Z", run_started_at: "2026-01-01T00:00:10Z",
      updated_at: "2026-01-01T00:01:10Z", actor: null,
    };
    expect(mapRun({ ...base, status: "completed" }).durationSec).toBe(60);
    expect(mapRun({ ...base, status: "in_progress" }).durationSec).toBe(0);
    expect(mapRun({ ...base, status: "completed" }).name).toBe("unnamed workflow");
  });
});

describe("parseRepo", () => {
  it("accepts owner/name", () => expect(parseRepo("vercel/next.js")).toEqual({ owner: "vercel", repo: "next.js" }));
  it("rejects garbage", () => {
    expect(parseRepo(null)).toBeNull();
    expect(parseRepo("nope")).toBeNull();
    expect(parseRepo("a/b/c")).toBeNull();
    expect(parseRepo("../etc/passwd")).toBeNull();
  });
});

describe("format", () => {
  it("formats durations", () => {
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(125)).toBe("2m 5s");
    expect(formatDuration(3900)).toBe("1h 5m");
  });
  it("formats minutes", () => {
    expect(formatMinutes(null)).toBe("n/a");
    expect(formatMinutes(30)).toBe("30m");
    expect(formatMinutes(120)).toBe("2.0h");
  });
});
