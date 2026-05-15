type MetricTileProps = {
  label: string;
  value: string;
  tone?: "default" | "signal" | "warn";
};

export function MetricTile({ label, value, tone = "default" }: MetricTileProps) {
  const toneClass = tone === "signal" ? "text-signal" : tone === "warn" ? "text-warn" : "text-white";

  return (
    <div className="border border-line bg-panel p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-2 font-mono text-xl ${toneClass}`}>{value}</p>
    </div>
  );
}
