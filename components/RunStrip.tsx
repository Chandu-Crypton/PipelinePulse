import type { WorkflowRun } from "@/lib/types";
import { formatDuration } from "@/lib/format";

function colour(run: WorkflowRun) {
  if (run.conclusion === "success") return "bg-pass";
  if (run.conclusion === "failure") return "bg-fail";
  if (run.status !== "completed") return "bg-wait";
  return "bg-line";
}

// One bar per run, oldest on the left. Height = duration, colour = outcome.
export default function RunStrip({ runs }: { runs: WorkflowRun[] }) {
  const ordered = [...runs].reverse();
  const max = Math.max(...ordered.map((r) => r.durationSec), 1);

  return (
    <figure aria-label="Recent workflow runs by duration and outcome">
      <div className="flex h-44 items-end gap-1 overflow-x-auto">
        {ordered.map((run) => (
          <a
            key={run.id}
            href={run.url}
            target="_blank"
            rel="noreferrer"
            title={`${run.name}: ${run.conclusion ?? run.status}, ${formatDuration(run.durationSec)}`}
            className={`min-w-2 flex-1 rounded-t-sm ${colour(run)} hover:opacity-70`}
            style={{ height: `${Math.max((run.durationSec / max) * 100, 6)}%` }}
          >
            <span className="sr-only">
              {run.name} {run.conclusion ?? run.status} {formatDuration(run.durationSec)}
            </span>
          </a>
        ))}
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        <span><i className="mr-1.5 inline-block size-2.5 rounded-sm bg-pass" />Passed</span>
        <span><i className="mr-1.5 inline-block size-2.5 rounded-sm bg-fail" />Failed</span>
        <span><i className="mr-1.5 inline-block size-2.5 rounded-sm bg-wait" />Running</span>
        <span className="ml-auto">Bar height shows build time. Oldest run on the left.</span>
      </figcaption>
    </figure>
  );
}
