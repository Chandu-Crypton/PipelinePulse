export interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  branch: string;
  event: string;
  actor: string;
  url: string;
  createdAt: string;
  durationSec: number;
}

export interface Metrics {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  successRate: number; // percent
  avgDurationSec: number;
  p95DurationSec: number;
  runsPerDay: number;
  mttrMinutes: number | null;
}

export interface RunsResponse {
  repo: string;
  fetchedAt: string;
  metrics: Metrics;
  runs: WorkflowRun[];
}
