"use client";

import { useState } from "react";
import type { RunsResponse } from "@/lib/types";
import { formatDuration, formatMinutes } from "@/lib/format";
import RunStrip from "@/components/RunStrip";
import RunsTable from "@/components/RunsTable";
import Stat from "@/components/Stat";

const EXAMPLES = ["vercel/next.js", "facebook/react", "microsoft/vscode"];

export default function Home() {
  const [repo, setRepo] = useState("vercel/next.js");
  const [data, setData] = useState<RunsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze(target: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/runs?repo=${encodeURIComponent(target)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Something went wrong.");
      setData(body as RunsResponse);
    } catch (e) {
      setData(null);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const m = data?.metrics;

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Is this repo&apos;s pipeline healthy?
        </h1>
        <p className="mt-4 text-lg text-muted">
          Paste any public GitHub repository. PipelinePulse reads its last 50 Actions runs and shows how often builds
          pass, how long they take, and how fast the team recovers from a red build.
        </p>
      </header>

      <form
        className="mt-8 flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          analyze(repo);
        }}
      >
        <label htmlFor="repo" className="sr-only">GitHub repository</label>
        <input
          id="repo"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="owner/repository"
          className="w-full rounded-md border border-line bg-white px-4 py-3 font-medium sm:max-w-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-ink px-6 py-3 font-medium text-white hover:bg-signal disabled:opacity-60"
        >
          {loading ? "Analyzing..." : "Analyze pipeline"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => { setRepo(ex); analyze(ex); }}
            className="rounded-full border border-line px-3 py-1 text-muted hover:border-ink hover:text-ink"
          >
            {ex}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {error && (
          <p role="alert" className="mt-8 rounded-md border border-fail/40 bg-fail/10 px-4 py-3 text-fail">
            {error}
          </p>
        )}
      </div>

      {!data && !error && !loading && (
        <p className="mt-12 text-muted">Pick an example above or enter a repository to see its pipeline.</p>
      )}

      {data && m && (
        <section className="mt-12 space-y-12">
          <div>
            <h2 className="font-display text-2xl font-semibold">{data.repo}</h2>
            <p className="text-sm text-muted">Updated {new Date(data.fetchedAt).toLocaleTimeString()}</p>
          </div>

          <RunStrip runs={data.runs} />

          <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <Stat label="Success rate" value={`${m.successRate}%`} hint={`${m.failedRuns} failed of ${m.completedRuns} finished`} />
            <Stat label="Average build" value={formatDuration(m.avgDurationSec)} hint={`P95: ${formatDuration(m.p95DurationSec)}`} />
            <Stat label="Runs per day" value={String(m.runsPerDay)} hint="Proxy for deploy frequency" />
            <Stat label="Recovery time" value={formatMinutes(m.mttrMinutes)} hint="Failure to next green (MTTR)" />
          </dl>

          <div>
            <h3 className="mb-3 font-display text-xl font-semibold">Latest runs</h3>
            <RunsTable runs={data.runs} />
          </div>
        </section>
      )}
    </main>
  );
}
