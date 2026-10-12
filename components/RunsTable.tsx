import type { WorkflowRun } from "@/lib/types";
import { formatDuration } from "@/lib/format";

const badge: Record<string, string> = {
  success: "text-pass",
  failure: "text-fail",
};

export default function RunsTable({ runs }: { runs: WorkflowRun[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-muted">
          <tr>
            <th className="py-2 pr-4 font-medium">Workflow</th>
            <th className="py-2 pr-4 font-medium">Result</th>
            <th className="py-2 pr-4 font-medium">Branch</th>
            <th className="py-2 pr-4 font-medium">Trigger</th>
            <th className="py-2 pr-4 font-medium">Duration</th>
            <th className="py-2 font-medium">Started</th>
          </tr>
        </thead>
        <tbody>
          {runs.slice(0, 15).map((r) => (
            <tr key={r.id} className="border-b border-line/60">
              <td className="py-2 pr-4">
                <a href={r.url} target="_blank" rel="noreferrer" className="font-medium underline-offset-2 hover:underline">
                  {r.name}
                </a>
              </td>
              <td className={`py-2 pr-4 font-medium ${badge[r.conclusion ?? ""] ?? "text-muted"}`}>
                {r.conclusion ?? r.status}
              </td>
              <td className="py-2 pr-4">{r.branch}</td>
              <td className="py-2 pr-4">{r.event}</td>
              <td className="py-2 pr-4 tabular-nums">{r.status === "completed" ? formatDuration(r.durationSec) : "-"}</td>
              <td className="py-2 text-muted">{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
