import type { Metrics, WorkflowRun } from "./types";

const round = (n: number, digits = 1) => Math.round(n * 10 ** digits) / 10 ** digits;

export function computeMetrics(runs: WorkflowRun[]): Metrics {
  const completed = runs.filter((r) => r.conclusion === "success" || r.conclusion === "failure");
  const successes = completed.filter((r) => r.conclusion === "success").length;
  const failed = completed.length - successes;

  const durations = completed.map((r) => r.durationSec).sort((a, b) => a - b);
  const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const p95 = durations.length ? durations[Math.min(durations.length - 1, Math.ceil(durations.length * 0.95) - 1)] : 0;

  // Runs per day across the observed window (proxy for deployment frequency)
  const times = runs.map((r) => Date.parse(r.createdAt));
  const spanDays = times.length > 1 ? Math.max((Math.max(...times) - Math.min(...times)) / 86_400_000, 1) : 1;

  // MTTR: time from the first failure of a workflow to its next success
  const chronological = [...completed].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const openFailures = new Map<string, number>();
  const recoveries: number[] = [];
  for (const run of chronological) {
    const t = Date.parse(run.createdAt);
    if (run.conclusion === "failure") {
      if (!openFailures.has(run.name)) openFailures.set(run.name, t);
    } else if (openFailures.has(run.name)) {
      recoveries.push((t - openFailures.get(run.name)!) / 60_000);
      openFailures.delete(run.name);
    }
  }
  const mttr = recoveries.length ? round(recoveries.reduce((a, b) => a + b, 0) / recoveries.length) : null;

  return {
    totalRuns: runs.length,
    completedRuns: completed.length,
    failedRuns: failed,
    successRate: completed.length ? round((successes / completed.length) * 100) : 0,
    avgDurationSec: avg,
    p95DurationSec: p95,
    runsPerDay: round(runs.length / spanDays, 2),
    mttrMinutes: mttr,
  };
}
