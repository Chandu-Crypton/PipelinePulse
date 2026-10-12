import { NextResponse, type NextRequest } from "next/server";
import { fetchWorkflowRuns, GitHubError } from "@/lib/github";
import { computeMetrics } from "@/lib/metrics";
import { parseRepo } from "@/lib/validate";
import type { RunsResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get("repo");
  const parsed = parseRepo(input);

  if (!parsed) {
    return NextResponse.json({ error: 'Enter a repository as "owner/name".' }, { status: 400 });
  }

  try {
    const runs = await fetchWorkflowRuns(parsed.owner, parsed.repo);
    const body: RunsResponse = {
      repo: `${parsed.owner}/${parsed.repo}`,
      fetchedAt: new Date().toISOString(),
      metrics: computeMetrics(runs),
      runs,
    };
    return NextResponse.json(body, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" } });
  } catch (err) {
    if (err instanceof GitHubError) return NextResponse.json({ error: err.message }, { status: err.status });
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
