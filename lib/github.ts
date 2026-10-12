import type { WorkflowRun } from "./types";

export interface GitHubRun {
  id: number;
  name: string | null;
  status: string | null;
  conclusion: string | null;
  head_branch: string | null;
  event: string;
  html_url: string;
  created_at: string;
  run_started_at?: string;
  updated_at: string;
  actor?: { login: string } | null;
}

export class GitHubError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export function mapRun(r: GitHubRun): WorkflowRun {
  const start = Date.parse(r.run_started_at ?? r.created_at);
  const end = Date.parse(r.updated_at);
  const done = r.status === "completed";
  return {
    id: r.id,
    name: r.name ?? "unnamed workflow",
    status: r.status ?? "unknown",
    conclusion: r.conclusion,
    branch: r.head_branch ?? "-",
    event: r.event,
    actor: r.actor?.login ?? "unknown",
    url: r.html_url,
    createdAt: r.created_at,
    durationSec: done ? Math.max(0, Math.round((end - start) / 1000)) : 0,
  };
}

export async function fetchWorkflowRuns(owner: string, repo: string, perPage = 50): Promise<WorkflowRun[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "pipelinepulse",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=${perPage}`, {
    headers,
    next: { revalidate: 60 }, // cache upstream responses for a minute
  });

  if (res.status === 404) throw new GitHubError("Repository not found, or it is private.", 404);
  if (res.status === 403 || res.status === 429) {
    throw new GitHubError("GitHub rate limit reached. Add a GITHUB_TOKEN or try again later.", 429);
  }
  if (!res.ok) throw new GitHubError(`GitHub returned ${res.status}.`, 502);

  const body = (await res.json()) as { workflow_runs: GitHubRun[] };
  return body.workflow_runs.map(mapRun);
}
