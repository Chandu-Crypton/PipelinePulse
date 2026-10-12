export default function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="border-l-2 border-ink pl-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-display text-3xl font-semibold tabular-nums">{value}</dd>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
