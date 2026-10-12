export function formatDuration(totalSec: number): string {
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m < 60) return `${m}m ${s}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function formatMinutes(mins: number | null): string {
  if (mins === null) return "n/a";
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = mins / 60;
  if (h < 48) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}
